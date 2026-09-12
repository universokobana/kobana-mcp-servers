[< Decisions](../index.md)

# MD-002 — Stateless Streamable HTTP; every request is authenticated

**Date:** 2026-08-11
**Origin:** PSQ-001. Recorded retroactively at Ariad adoption on 2026-09-12; the
decision has been enforced in code since `688209d` and is documented in the root
[CHANGELOG](../../../../CHANGELOG.md).

---

**Context:** the standalone HTTP servers used an SSE transport with a session map.
That design authenticated the bearer token **once**, when the stream opened, and
then authorized every subsequent tool call by session id alone. The session id came
from `Math.random()` (~46 bits, not a CSPRNG), was published in an `X-Session-Id`
response header, and was readable cross-origin because the servers sent
`Access-Control-Allow-Origin: *` together with `Access-Control-Expose-Headers`.

The exploitable path required no token at all: `parseConfig` falls back to
`getConfig()`, meaning the process's own `KOBANA_ACCESS_TOKEN` — which is exactly how
`npm run start:http` is documented to run. Combined with the wildcard CORS policy and
the `0.0.0.0` bind, any web page the operator visited could open a session, read the
session id out of the response headers, and issue tool calls that executed against
the real Kobana API under the server's own credentials. No brute force involved.

**Decision:**

- **(1) The SSE transport and its session map are removed** from all packages. The
  `/sse` plus `/messages?sessionId=…` pair no longer exists.
- **(2) Authorization is per request.** Each request constructs a fresh `Server` and
  a `StreamableHTTPServerTransport` in stateless mode. There is no server-side
  session to hijack, because there is no session.
- **(3) Session identity is never an authorization credential.** A value that
  identifies a conversation is not a value that authorizes an action.

**Consequence:**

- Statelessness is a **security property here, not a scaling choice**. A future
  change that reintroduces server-side session state reopens this finding and must
  be treated as a security decision, not an optimization.
- This is why the packages hold no state worth persisting, and why this repository
  has no database section in its engineering principles.

**Status:** Active across all ten packages.
