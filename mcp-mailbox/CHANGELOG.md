# Changelog — kobana-mcp-mailbox

All notable changes to this package. Each package in the
[kobana-mcp-servers](https://github.com/universokobana/kobana-mcp-servers) monorepo is
published independently with its own version, so this file tracks **this package's**
versions; the repository-level `CHANGELOG.md` at the root tracks cross-package
milestones.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 1.1.1 — 2026-09-12

### Security

Two fixes that had already been merged into `main` are published here for the
first time. While they sat unreleased, `1.0.0`–`1.0.1` stayed the installable
artifact.

- **Stateless Streamable HTTP transport (PSQ-001)** — merged 2026-08-11, published
  2026-09-12: **absent from npm for one month.** The previous SSE transport
  authenticated the bearer token once, when the stream opened, then authorized every
  subsequent tool call by session id alone. That id came from `Math.random()` (~46
  bits, not a CSPRNG), was published in an `X-Session-Id` response header, and was
  readable cross-origin because the server sent `Access-Control-Allow-Origin: *`
  together with `Access-Control-Expose-Headers`. Because `parseConfig` falls back to
  the process's own `KOBANA_ACCESS_TOKEN` — which is how `npm run start:http` is
  documented to run — any web page the operator visited could open a session, read the
  id straight out of the response headers, and issue tool calls that executed against
  the real Kobana API under the server's own credentials. No brute force required.
  Authorization is now per request: each request builds a fresh server and transport,
  with no session map and no session identifier.

  **Scope: the HTTP transport only.** If you run this package over **stdio** — the
  default, and how it is normally spawned by an MCP client — you were not exposed.

- **HTTP redirects are refused (`redirect: 'error'`)** — merged 2026-06-15, published
  2026-09-12: **absent from npm for three months.** `fetch` follows redirects by
  default and re-sends request headers to the redirect target, so a redirect to an
  attacker-controlled host would have received the `Authorization` header carrying
  your Kobana access token. This closes the second hop of the SSRF chain whose first
  hop was fixed in 1.0.1.

### Fixed

- **A per-request timeout fences the whole exchange.** Previously `KobanaApiClient`
  performed a bare `fetch` with no timeout. `fetch` resolves as soon as response
  *headers* arrive, so an origin that accepted a request and never completed the body
  left `response.json()` awaiting forever — hanging the tool call with no upper bound.
  Observed in production on 2026-08-24 against the financial statement summary
  endpoint, where two calls sat silent past a calling client's 125s watchdog and
  killed its whole agent turn.

  One `AbortSignal.timeout` now covers connection, headers **and** body reads.
  Timeouts raise a dedicated `KobanaApiTimeoutError`, distinct from `KobanaApiError`
  because there is no server answer to report. Default 30s, tunable with
  `KOBANA_API_TIMEOUT_MS`.

### Fixed

- **The reported version is now the real one.** `serverInfo.version` in the MCP
  handshake, the `/health` and `/` responses of the HTTP server, and the `User-Agent`
  sent to the Kobana API were all hardcoded `1.0.0` while this package's manifest had
  moved on. Anyone debugging a version-specific problem started from a false premise.
  All of them now read this package's `package.json`, and a test asserts they cannot
  drift again. The `User-Agent` changes shape from `kobana-mcp-server/1.0.0` to
  `kobana-mcp-mailbox/1.1.1`.

### Upgrading

If you are running **1.0.0 or 1.0.1**, upgrade. Those versions remain installable from
npm but do not contain the fixes above.
