# Changelog — kobana-mcp-payment

All notable changes to this package. Each package in the
[kobana-mcp-servers](https://github.com/universokobana/kobana-mcp-servers) monorepo is
published independently with its own version, so this file tracks **this package's**
versions; the repository-level `CHANGELOG.md` at the root tracks cross-package
milestones.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

- **Money amounts are stated in cents, and said so where a model can read it.**
  The Kobana platform stores money in **cents**; these tools described `amount` as
  `'Amount in BRL (e.g., 120.99)'` in ten payment fields. A model following that
  description under-pays by a factor of 100, and the consumer that surfaces the
  value for human approval shows the number verbatim — so the confirmation screen
  agrees with the mistake instead of catching it.

  It is not hypothetical. On 2026-09-13, in `kia-desktop`, three water bills of
  R$ 980,00 were sent as `amount: 980`, registered by Kobana as **R$ 9,80 each**,
  and approved by a person reading `VALOR 980` as reais.

  Two changes, because consumers read two different things:

  - every `amount` now describes itself as cents, with an integer example
    (`1000 = R$ 10,00`) — for consumers that hand a model the full JSON schema;
  - every money tool's **first sentence** names the unit — for consumers that
    show a model a tool summary rather than a schema. `kia-desktop` is one: since
    its D121 it serves `firstSentence(description)` plus an argument digest of
    `name:type` pairs, so a parameter description never reaches the model there.
    Measured over that path: 0/9 amounts correct with the unit only in the
    parameter, 18/18 with it in the first sentence.

- **`amount` now validates as an integer.** A fractional cent does not exist, so
  the server refuses `120.99` instead of letting the platform decide what it
  means. **This is a behaviour change for any caller that was sending reais:** it
  now gets a validation error where it previously got a payment worth a hundredth
  of the intended value. That is the intended outcome — a loud failure replacing a
  silent one — but it is a break, and callers that followed the old description
  need to convert before upgrading.

### Added

- `tests/unit/money-unit-contract.test.ts` — the unit must be stated in both
  places, in `src/` and in the built `dist/`, and may never say BRL again. A tool
  description is behaviour (principles §6), and this is the guard that keeps a
  future copy edit from quietly restoring the defect.

## 1.1.1 — Unreleased

> ### ⚠ Not published yet
>
> The repository declares `1.1.1`, but npm still serves **`1.0.1`**. Everything below is
> merged and verified; only the publish step is outstanding, blocked on registry
> credentials. **Until it happens, the fixes described here are not in the artifact you
> install.** This heading becomes `1.1.1 — <date>` when the release actually goes out.


### Security

Two fixes merged into `main` that have **never been published**. While they sit
unreleased, the versions listed below remain the installable artifact.

- **Stateless Streamable HTTP transport (PSQ-001)** — merged 2026-08-11 and **still
  not on npm as of 2026-09-12: over a month unreleased.** The previous SSE transport
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
  default, and how an MCP client normally spawns it — you were never exposed through
  this path.

- **HTTP redirects are refused (`redirect: 'error'`)** — merged 2026-06-15 and **still
  not on npm as of 2026-09-12: three months unreleased.** `fetch` follows redirects by
  default and re-sends request headers to the redirect target, so a redirect to an
  attacker-controlled host would have received the `Authorization` header carrying your
  Kobana access token. This closes the second hop of the SSRF chain whose first hop was
  fixed in `1.0.1`.

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
  `kobana-mcp-payment/1.1.1`.

### When this is published

If you are running **1.0.1**, upgrade as soon as `1.1.1` appears on npm — that version
does not contain the fixes above.
