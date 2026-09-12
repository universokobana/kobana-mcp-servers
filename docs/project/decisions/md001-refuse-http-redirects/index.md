[< Decisions](../index.md)

# MD-001 — `KobanaApiClient` refuses to follow HTTP redirects

**Date:** 2026-06-15
**Origin:** White Hat program report of 2026-06-15, Finding 1 (the
`X-Kobana-Api-Url` SSRF chain). Recorded retroactively at Ariad adoption on
2026-09-12; the decision has been enforced in code since `df81c0a`.

---

**Context:** every request carries a bearer token in an `Authorization` header.
`fetch` follows redirects by default and **re-sends headers to the redirect
target**. An attacker who could influence the API base URL — the first hop of the
reported SSRF chain — could therefore point a request at a host they controlled and
receive the caller's Kobana access token.

**Decision:** `KobanaApiClient.request` passes `redirect: 'error'`. A redirect
response is a failure, not something to follow.

The reasoning is that Kobana API endpoints do not redirect under normal operation,
so nothing legitimate is lost, and the second hop of the SSRF chain is closed
structurally rather than by validating the target.

**Consequence:**

- Closing the second hop is independent of the first: even if URL validation were
  bypassed, the token does not travel.
- Any future Kobana endpoint that legitimately redirects will fail loudly here and
  must be handled explicitly rather than by relaxing this flag.
- The flag is load-bearing and easy to lose in a refactor. When the timeout fence
  restructured this method into a `try`/`catch` on 2026-08-24, `redirect: 'error'`
  was deliberately preserved and called out in the diff.

**Status:** Active. Present in every package that has a `KobanaApiClient`.
