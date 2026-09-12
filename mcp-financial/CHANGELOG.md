# Changelog — kobana-mcp-financial

All notable changes to this package. Each package in the
[kobana-mcp-servers](https://github.com/universokobana/kobana-mcp-servers) monorepo is
published independently with its own version, so this file tracks **this package's**
versions; the repository-level `CHANGELOG.md` at the root tracks cross-package
milestones.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


## 1.2.1 — Unreleased

> ### ⚠ Not published yet
>
> The repository declares `1.2.1`, but npm still serves **`1.2.0`**. Everything below is
> merged and verified; only the publish step is outstanding, blocked on registry
> credentials. **Until it happens, the fixes described here are not in the artifact you
> install.** This heading becomes `1.2.1 — <date>` when the release actually goes out.


### Fixed

- **A per-request timeout fences the whole exchange.** Previously `KobanaApiClient`
  performed a bare `fetch` with no timeout. `fetch` resolves as soon as response
  *headers* arrive, so an origin that accepted a request and never completed the body
  left `response.json()` awaiting forever — hanging the tool call with no upper bound.
  Observed in production on 2026-08-24 against the financial statement summary
  endpoint, where two calls sat silent past a calling client's 125s watchdog and killed
  its whole agent turn.

  One `AbortSignal.timeout` now covers connection, headers **and** body reads. Timeouts
  raise a dedicated `KobanaApiTimeoutError`, distinct from `KobanaApiError` because
  there is no server answer to report. Default 30s, tunable with
  `KOBANA_API_TIMEOUT_MS`.

- **The reported version is now the real one.** `serverInfo.version` in the MCP
  handshake, the `/health` and `/` responses of the HTTP server, and the `User-Agent`
  sent to the Kobana API were all hardcoded `1.0.0` while this package's manifest had
  moved on. Anyone debugging a version-specific problem started from a false premise.
  All of them now read this package's `package.json`, and a test asserts they cannot
  drift again. The `User-Agent` changes shape from `kobana-mcp-server/1.0.0` to
  `kobana-mcp-financial/1.2.1`.

### Note

Unlike its sibling packages, the published `1.2.0` already carried the stateless HTTP
transport (PSQ-001) and the redirect refusal, so this release is not a security
catch-up — it is the timeout fence plus version truth.

### When this is published

If you are running **1.2.0**, upgrade as soon as `1.2.1` appears on npm — that version
does not contain the fixes above.
