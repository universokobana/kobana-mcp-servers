# AGENTS.md

Workflow authority for AI agents and humans working in this repository. Read by Pi,
Codex and Claude Code (`CLAUDE.md` points here, so there is one source instead of two
that drift).

## Read these before non-trivial work

| Document | What it settles |
|---|---|
| [Engineering principles](docs/project/engineering-principles.md) | What good work looks like here, and the [Definition of Done](docs/project/engineering-principles.md#9-definition-of-done) |
| [Development guide](docs/process/development-guide.md) | How work moves — Ariad lifecycle, checkpoints, hard stops |
| [Roadmap](docs/project/roadmap/index.md) | What is active and why CV1 is release, not tests |
| [Decisions](docs/project/decisions/index.md) | `MD<n>` — decisions already taken; do not relitigate silently |
| [Debt ledger](docs/project/roadmap/technical-debt-ledger.md) | `TD<n>` — known debt, so you do not "discover" it twice |

## Project overview

A **public** monorepo of ten Model Context Protocol servers providing AI-native access
to the Kobana financial automation API v2. Each package covers one domain: `admin`,
`charge`, `data`, `edi`, `financial`, `help`, `mailbox`, `payment`, `site`, `transfer`.

Each is published independently on npm. **Eight are npm `workspaces`; `mcp-help` and
`mcp-site` are not** (TD-006), so root-level commands skip them — check them
explicitly.

### Who consumes this, and how

This matters for nearly every change:

| Consumer | How | Consequence |
|---|---|---|
| `kia-desktop` | pins exact versions, vendors them into a signed Tauri bundle with `--ignore-scripts` | Cannot receive a fix without a publish. It currently carries a **committed override** of `kobana-mcp-financial`'s built files (TD-007) |
| `kadu` | `npx -y kobana-mcp-*` for seven packages | Consumes **latest on npm instantly**, with no pin and therefore no rollback |

Also: **117 of the 122 tools** in `kia-desktop`'s eval field catalog originate here,
descriptions carried verbatim. A tool description edit is a model-facing **behavior
change** (principles §6, TD-009).

## Commands

```bash
# Build all workspace packages (skips mcp-help and mcp-site — TD-006)
npm run build

# Build / watch / clean a single package
cd mcp-financial && npm run build
cd mcp-financial && npm run dev
cd mcp-financial && npm run clean

# Typecheck one package (no root script; there is no CI to catch this for you)
cd mcp-financial && ../node_modules/.bin/tsc --noEmit

# Typecheck every package, including the two outside workspaces
for p in mcp-*/; do (cd "$p" && ../node_modules/.bin/tsc --noEmit) || echo "FAILED: $p"; done

# Run a stdio MCP server
KOBANA_ACCESS_TOKEN=token npx kobana-mcp-financial

# Run the HTTP server (local debugging only — read Transport Modes first)
cd mcp-financial && npm run start:http
```

There is **no test command**: this repository has no tests
([CV2](docs/project/roadmap/cv2-test-infrastructure/index.md) exists to fix that).
Do not mistake a green build for a verified change.

## Gates before every integration

There is no CI and no branch protection (MD-004). **These are the only gate.**

```bash
for p in mcp-*/; do (cd "$p" && ../node_modules/.bin/tsc --noEmit) || echo "FAILED: $p"; done
npm run build
npm test   # once CV2 lands
```

Run them before integrating, not after. `main` stays releasable at every integration.

## Git workflow

- **No branch protection, deliberately** (MD-004) — verified against the actual rule
  state of all three repositories. A force-push can rewrite `main`; nothing stops it
  but you.
- Short branches plus a PR are the norm, but nothing enforces it and self-merge is
  permitted. PRs #10 and #11 (2026-09-12) were merged unreviewed and unsigned; under
  `kia-backend`'s ruleset neither would have merged.
- History is **linear** — zero merge commits. Use `--rebase` or `--squash`, never a
  merge commit.
- Commits: small, English, one concern, message explains the **why**.
- After every push, verify rather than assume: `gh pr checks <n>`, `gh run list`.

## Hard stops — ask before doing any of these

- Changing a **tool name, description or schema** — model-facing behavior (§6)
- Touching the **access token, transports, redirect policy or timeout fencing** —
  MD-001, MD-002
- **Publishing to npm** or bumping a version
- Adding a dependency
- Deleting or skipping a test
- Touching CI workflows
- Any scope expansion beyond what was asked

Activating a journey or loading context is **not** consent to implement.

## Architecture

### Package structure

Each `mcp-*/` package:

- `src/index.ts` — stdio transport entry point (shebang, CLI)
- `src/http-server.ts` — Streamable HTTP transport entry point
- `src/server.ts` — core MCP server with tool registration
- `src/config.ts` — environment configuration loader
- `src/api/client.ts` — `KobanaApiClient`: auth, timeout, redirect policy, error typing
- `src/api/[resource].ts` — API methods grouped by resource
- `src/tools/[resource].ts` — tool definitions with zod schemas
- `src/types/schemas.ts` — zod validation schemas
- `src/types/api.ts` — TypeScript interfaces

The layer direction is the architecture: **`tool → api → client`**. Never put HTTP
concerns in a tool handler, nor envelope concerns in the client.

**`client.ts` is duplicated across eight packages** (MD-005, TD-001). A fix to one
almost certainly belongs in all of them — prove the regions identical first, then
apply by a script whose every replacement asserts, so drift aborts instead of
half-applying. Do not cite MD-005 to justify *new* duplication.

### Tool definition pattern

```typescript
export const myTool: ToolDefinition = {
  name: '[action]_[namespace]_[resource]',  // e.g. list_financial_accounts
  description: 'Tool description',
  inputSchema: zodSchema,
  handler: async (client, args) => {
    try {
      const params = zodSchema.parse(args);
      const result = await apiMethod(client, params);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};
```

### The client's load-bearing properties

`KobanaApiClient.request` carries three properties that are easy to lose in a refactor
and expensive to lose in production:

- **`redirect: 'error'`** (MD-001) — `fetch` re-sends headers to a redirect target, so
  following one could hand the bearer token to an attacker-controlled host.
- **One `AbortSignal.timeout` fencing the whole exchange** — created before `fetch` and
  passed as `signal`, so it covers connection, headers **and** body reads. `fetch`
  resolves on headers; an origin that stalls the body hangs `response.json()` forever.
  This is why the body read is `await response.json()` and not a returned promise: the
  `await` keeps it inside the `try`.
- **`KobanaApiTimeoutError`**, distinct from `KobanaApiError` — there is no server
  answer to report.

Default timeout 30s, overridable via `KOBANA_API_TIMEOUT_MS`. Observed failure that
produced this: 2026-08-24, `/statement_transactions/summary` accepted requests and
never completed them, hanging two tool calls past a 125s watchdog.

### Zod to JSON Schema

Each server implements `zodToJsonSchema()` in `server.ts` for MCP protocol
compatibility, handling objects, strings, numbers, booleans, enums, arrays and records.

### Transport modes

1. **Stdio** (default) — how consumers spawn these, via `index.ts`.
2. **Streamable HTTP** — per-package single-namespace server via `http-server.ts`
   (`POST /mcp`, `/health`, `/`), useful for local debugging.

   The HTTP server is **stateless**: each request builds a fresh `Server` +
   `StreamableHTTPServerTransport` (`sessionIdGenerator: undefined`) and is
   authenticated on its own. There is no session map and no session identifier. This is
   a **security property** (MD-002), not a scaling choice — the previous SSE design
   authorized tool calls by a `Math.random()` session id that was readable
   cross-origin. Keep all three properties when touching this file:

   - **Auth per request.** Never hoist credential resolution out of the per-request
     path or cache a `Config` between requests.
   - **Loopback bind.** `HOST` defaults to `127.0.0.1`. This server falls back to
     `KOBANA_ACCESS_TOKEN` from its own environment, so binding `0.0.0.0` hands that
     token to anything routable to the host.
   - **Origin validation.** Requests carrying an `Origin` header are rejected with 403
     unless listed in `MCP_ALLOWED_ORIGINS` (empty by default). Never reintroduce
     `Access-Control-Allow-Origin: *`.

   The legacy SSE transport (`/sse` + `/messages?sessionId=…`) was removed; both paths
   answer 410.

## Configuration

| Variable | Required | Default |
|----------|----------|---------|
| `KOBANA_ACCESS_TOKEN` | Yes | — |
| `KOBANA_API_URL` | No | `https://api.kobana.com.br` |
| `KOBANA_API_TIMEOUT_MS` | No | `30000` — per-request timeout; invalid or non-positive values fall back to the default |
| `PORT` | No | 3000 |
| `HOST` | No | `127.0.0.1` (HTTP mode; read Transport Modes before changing) |
| `MCP_ALLOWED_ORIGINS` | No | empty — no browser origin is trusted (HTTP mode) |

Sandbox: `https://api-sandbox.kobana.com.br`

## Key conventions

- **Tool naming**: `[verb]_[namespace]_[resource]` (e.g. `create_financial_account`).
  A mutating tool must never be named so a `list_/get_/query_` prefix heuristic would
  auto-approve it (principles §5).
- **API paths**: `/v2/[namespace]/[resource]`
- **Error responses**: always `{ success: false, error: string, details?: unknown }`
- **Success responses**: always `{ success: true, data: unknown }`
- All inputs validated with zod before API calls
- Bearer token auth via `Authorization`; `X-Idempotency-Key` supported for POST
- **Version is `package.json`.** `serverInfo.version` and the `User-Agent` are
  currently hardcoded `1.0.0` and wrong (TD-004) — do not copy that pattern

## Adding new tools

1. Add the zod schema in `src/types/schemas.ts`
2. Add the API method in `src/api/[resource].ts`
3. Create the tool definition in `src/tools/[resource].ts`
4. Export it from `src/tools/index.ts`
5. Registration is automatic via the tools array in `server.ts`

Then treat the name and description as a behavior change: they enter another
repository's eval catalog verbatim (principles §6).

## Before you claim done

Walk the [Definition of Done](docs/project/engineering-principles.md#9-definition-of-done).
Do not summarize it from memory. Two items are specific to this repository and most
often missed:

- **The release decision.** Merged is not delivered. Bump and publish, or record the
  deferral and who is left unserved.
- **The consumer question.** Does this reach `kadu` instantly via `npx -y`? Does
  `kia-desktop`'s pin or override need to change?
