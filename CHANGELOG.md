# Changelog

All notable changes to this project are documented here. Each MCP package is
published independently on npm with its own version, so this file tracks
**repo-level** milestones: new servers, OAuth and transport infrastructure,
breaking configuration changes, and major documentation.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 2026-06-14 — SSRF hardening in `http-server.ts`

### Security
- **Validate `X-Kobana-Api-Url` before dispatch** in the standalone HTTP
  servers shipped by `mcp-admin`, `mcp-charge`, `mcp-data`, `mcp-edi`,
  `mcp-financial`, `mcp-mailbox`, `mcp-payment`, and `mcp-transfer`. The
  header previously flowed unchecked into the upstream `KobanaApiClient`,
  letting a caller with a valid Bearer token redirect requests (and the
  caller's token) to any host. The new guard enforces `https://`, refuses IP
  literals (loopback, link-local, 169.254.169.254 cloud metadata, private
  ranges), and matches the hostname against a configurable allowlist (default
  `*.kobana.com.br`, override via `KOBANA_API_URL_ALLOWLIST`). Invalid
  values are rejected with `400 invalid_request`.
- **Validate `X-Kobana-Help-Url`** in `mcp-help` with the same scheme/IP/host
  allowlist rules (env var `KOBANA_HELP_URL_ALLOWLIST`). The help-center
  server doesn't forward a Kobana access token, but the header was still a
  blind-SSRF / metadata-endpoint vector.
- Affected versions: `kobana-mcp-{admin,charge,data,edi,financial,help,payment,transfer}@<=1.0.0`
  and `kobana-mcp-mailbox@<=1.0.1`. Fixed in `…@1.0.1` (mailbox `1.0.2`).
- The deployed Vercel server (`kobana-mcp-remote/api/index.ts`) was already
  guarded — this only affects operators who run the per-package
  `npm run start:http` / `bin/kobana-mcp-*-http` entrypoint directly.

## 2026-04-11 — Claude Desktop Custom Connectors

### Added
- **Per-namespace Kobana OAuth scope mapping** in both the deployed
  `api/index.ts` and `vercel-mcp/src/oauth/scopes.ts`. Every connector now
  requests `login`, `write`, and the Doorkeeper scopes that cover exactly the
  tools that namespace exposes.
- **RFC 9728 Protected Resource Metadata** per namespace at
  `/.well-known/oauth-protected-resource/{namespace}/mcp`, plus
  resource-aware `WWW-Authenticate` headers on every `401` response so
  compliant MCP clients can auto-discover the authorization server.
- **RFC 7591 Dynamic Client Registration** (`POST /register`) so Claude
  Desktop and other MCP clients can register themselves automatically
  without users pasting a Client ID / Secret.
- **Mailbox namespace wired into the deployed Vercel function**
  (`api/index.ts`). It had been added to `vercel-mcp/` earlier but missed the
  production entry point.
- **Branded OAuth success and error pages** in pt-BR with a dark theme on
  both the deployed function and the standalone `vercel-mcp/` server. The
  success page auto-redirects to the client's callback after a brief
  confirmation.
- **`.env` support in `vercel-mcp/`** development via `dotenv`, plus a
  checked-in `.env.example` covering every supported variable.
- **`npm run dev` / `npm run dev:fast`** hot-reload scripts for `vercel-mcp/`
  using `tsx watch`.
- **README installation instructions for 9 MCP clients**: Claude Desktop,
  Claude.ai web, Claude Code CLI, ChatGPT, Cursor, VS Code, Windsurf, Manus,
  and Perplexity.
- **`SECURITY.md`** pointing at Kobana's White Hat program
  (https://www.kobana.com.br/en/white-hat).

### Changed
- **`vercel-mcp/` migrated from the deprecated SSE transport** to
  `StreamableHTTPServerTransport` in stateless mode. Endpoints are now
  `POST/GET/DELETE /{namespace}/mcp` — the old `/{namespace}/sse` and
  `/{namespace}/messages` paths are gone.
- **OAuth authorization server metadata** (`/.well-known/oauth-authorization-server`)
  now advertises `registration_endpoint` and the full union of per-namespace
  scopes in `scopes_supported`.
- **`KOBANA_API_URL` and `KOBANA_APP_URL` renamed** to `KOBANA_API_BASE_URL`
  and `KOBANA_APP_BASE_URL`, centralized in one helper per entry point. The
  `X-Kobana-Api-Url` request header is unchanged.

### Security
- Unauthenticated `POST /{namespace}/mcp` requests now return a proper `401`
  with `WWW-Authenticate: Bearer realm="…", resource="…", resource_metadata="…"`
  so compliant MCP clients trigger the OAuth discovery flow instead of
  silently failing.
- Each connector receives a narrowly-scoped Kobana token (namespace scopes
  only, not the full account) when the user authorizes via Custom Connector.

## 2026-03-13 — Mailbox server

### Added
- **`kobana-mcp-mailbox`** (1.0.0 → 1.0.1): new MCP server for the Kobana
  Mailbox API v2 with 41 tools covering entries, files, and email/S3/SFTP/
  WhatsApp/Syncthing channel configuration.

## 2026-01-14 — Help Center and Website servers

### Added
- **`kobana-mcp-help`** (1.0.0): MCP server for the Kobana Help Center with
  `search_articles` and `get_article`. No authentication required.
- **`kobana-mcp-site`** (1.0.0): MCP server for searching Kobana website
  content with `search_pages` and `get_page`. No authentication required.

## 2025-12-28 — initial release

### Added
- **Seven MCP servers for Kobana API v2**: `kobana-mcp-admin`,
  `kobana-mcp-charge`, `kobana-mcp-data`, `kobana-mcp-edi`,
  `kobana-mcp-financial`, `kobana-mcp-payment`, and `kobana-mcp-transfer`
  (~113 tools combined across the 7 namespaces).
- **Stdio transport entry point** per package (`src/index.ts`) and a
  Streamable HTTP entry point (`src/http-server.ts`) for hosted deployments.
- **`vercel-mcp/` unified server** aggregating all seven servers under
  path-based routing (`/{namespace}/sse` at the time; reworked in April 2026
  to use Streamable HTTP).
- **OAuth 2.1 authentication** with PKCE and Redis-backed session storage,
  using environment-scoped Redis key prefixes (`mcp:sandbox:*`,
  `mcp:production:*`) so one Redis instance can be shared across environments.
- **Vercel serverless deployment** wiring (`vercel.json`, `api/index.ts`) so
  the entire MCP fleet runs as a single function behind `mcp.kobana.com.br`.
- **Documentation**: per-package READMEs, sandbox environment guidance, npm
  package badges in the root README, and a `CLAUDE.md` guide for AI-assisted
  contributions.
