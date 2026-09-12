[< Roadmap](../index.md)

# CV2 — Changes are provable

**Status:** ⚪ Planned

---

## Capability Value

A behavior change in these packages is demonstrated by a test that fails before it
and passes after, and a regression cannot return silently.

## Starting point: zero

There is no test runner, no test file and no `test` script in any of the ten
packages. The timeout fix of 2026-09-12 was verified by two throwaway scripts run
by hand against a local hang server. They worked — they proved the stalled-body
case that a mocked `fetch` would have missed entirely — and then they were
discarded. That is the gap in one sentence: the verification was real, and it left
nothing behind.

For comparison, `kia-desktop` carries 100 unit test files under vitest plus Rust,
Playwright and WebdriverIO suites; `kia-backend` runs three Jest projects plus
Playwright.

## Shape this will take

Constrained by [MD-005](../../decisions/md005-client-duplication-accepted/index.md):
the eight clients stay duplicated, so tests must **not** be written eight times.
The suite is parametrized over packages instead — one contract factory, each package
importing its own client. That also gives a natural home for the cross-package
assertions no single-package test could make, such as version lockstep.

The boundary to mock is the Kobana HTTP API; the substrate to keep real is a local
`http.createServer`, because that is what caught the failure mode that mattered.

## Candidate Stories

| Code | Story | Type | Outcome | Status |
|------|-------|------|---------|--------|
| CV2.DS1 | Vitest harness and the client contract suite | Technical Story | One parametrized suite proving the timeout fence, error typing, healthy pass-through and config resolution across every package that has a client | ⚪ Candidate |
| CV2.DS2 | Tool contract suite | Technical Story | Every registered tool proven to have a name, description, a zod schema that converts to JSON Schema, and a handler returning the documented envelope | ⚪ Candidate |
| CV2.DS3 | Coverage floor | Technical Story | A ratchet floor set from a measured baseline and raised only upward | ⚪ Candidate |

## Done Condition

A bug fix in this repository starts with a failing test as a matter of course, and
the two verification scripts written by hand in August have permanent equivalents.
