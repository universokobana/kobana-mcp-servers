# Changelog — kobana-mcp-transfer

All notable changes to this package. Each package in the
[kobana-mcp-servers](https://github.com/universokobana/kobana-mcp-servers) monorepo is
published independently with its own version, so this file tracks **this package's**
versions; the repository-level `CHANGELOG.md` at the root tracks cross-package
milestones.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


## 1.2.0 — Unreleased

> ### ⚠ Not published yet
>
> The repository declares `1.2.0`, but npm still serves **`1.0.1`**. `1.1.1` was never
> published either, so everything below — this version's fixes and `1.1.1`'s — is
> merged and verified but absent from the artifact you install. The publish step is
> outstanding, blocked on registry credentials. This heading becomes
> `1.2.0 — <date>` when the release actually goes out.

### Fixed

- **Every Pix, TED and internal transfer creation was rejected with a 422.** The six
  create calls wrapped their payload in an envelope — `{ transfer: … }` for singles,
  `{ transfer_batch: … }` for batches — but `specs/transfer.json` declares
  `new_transfer_*` flat at the root. Rails `wrap_parameters` only skips wrapping when
  the expected key is already present, and on `/v2/transfer/pix` that key is the
  resource (`pix`), not the namespace (`transfer`). The key being absent, the envelope
  was wrapped a second time, strong params matched nothing, and the API reported all
  eight required fields blank — including the ones the caller had plainly sent, which
  is what made the error read as a connector that built no body at all. Reported from a
  real failed transfer on 2026-10-01. `mcp-payment` was never affected: it posts flat,
  which is what `wrap_parameters` is built to receive.

  **This unblocks a write path that moves money.** `amount` is in **reais**, not
  cents (`120.99`), and no tool surfaces the `X-Idempotency-Key` that
  `createTransferPix` already accepts — so a retried call can create a second
  transfer.

### Changed

- **The four transfer list tools no longer advertise filters.** `list_transfer_pix`,
  `list_transfer_ted`, `list_transfer_internal` and `list_transfer_batches` declared
  up to eleven filter params each (`created_from`, `status`, `financial_account_uid`,
  `external_id`, `tags`, …). Every transfer list endpoint in the spec documents
  `page` and `per_page` and nothing else, so the server discarded the rest **without
  an error**: a caller asking for October got September and no indication why. A
  filter that silently fails to narrow is worse than an absent one, so the schemas are
  now bare pagination and the descriptions say to page and select client-side.

  Model-facing (TD-009): these four descriptions are carried verbatim into
  `kia-desktop`'s eval field catalog, so this is a behavior change there, not a copy
  edit.


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
  `kobana-mcp-transfer/1.1.1`.

### When this is published

If you are running **1.0.1**, upgrade as soon as `1.1.1` appears on npm — that version
does not contain the fixes above.
