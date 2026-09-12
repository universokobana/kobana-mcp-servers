# Changelog — kobana-mcp-site

All notable changes to this package. Each package in the
[kobana-mcp-servers](https://github.com/universokobana/kobana-mcp-servers) monorepo is
published independently with its own version, so this file tracks **this package's**
versions; the repository-level `CHANGELOG.md` at the root tracks cross-package
milestones.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 1.1.1 — 2026-09-12

### Security

A fix that had already been merged into `main` is published here for the first
time. While it sat unreleased, the earlier versions stayed the installable
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

### Fixed

- **The reported version is now the real one.** `serverInfo.version` in the MCP
  handshake, the `/health` and `/` responses of the HTTP server, and the `User-Agent`
  sent to the Kobana API were all hardcoded `1.0.0` while this package's manifest had
  moved on. Anyone debugging a version-specific problem started from a false premise.
  All of them now read this package's `package.json`, and a test asserts they cannot
  drift again. The `User-Agent` changes shape from `kobana-mcp-server/1.0.0` to
  `kobana-mcp-site/1.1.1`.

### Known gap

This package does not use `KobanaApiClient`, so the per-request timeout added to the
API packages does not apply to it. Its own outbound request is still unfenced and can
hang without an upper bound; that is tracked in the repository's technical debt ledger
and needs a timeout budget of its own rather than an inherited one.

### Upgrading

If you are running **1.0.x**, upgrade. Those versions remain installable from
npm but do not contain the fixes above.
