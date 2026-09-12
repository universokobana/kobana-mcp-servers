[< Decisions](../index.md)

# MD-003 — The summary endpoint is the only aggregation authority; totals are never recomputed client-side

**Date:** 2026-08-24
**Origin:** The `/statement_transactions/summary` production hang of 2026-08-24, and
the design question its fix raised. Recorded retroactively at Ariad adoption on
2026-09-12; enforced in code since `f4870e3` (PR #10).

---

**Context:** when the summary endpoint times out, the data needed to answer the
question is still reachable — `list_financial_statement_transactions` returns the
same rows, and the client could sum them. The tempting behavior is a silent
client-side fallback that keeps the tool "working".

**Decision:** the summarize tool does **not** recompute totals. On
`KobanaApiTimeoutError` it returns a truthful failure plus a `hint` naming the listing
route, and lets the caller decide.

The reasoning is that a second aggregation authority can disagree with the server
about money. A client-side sum that differs from the server's — different rounding,
different inclusion rules, a filter the client does not model — produces a number
that looks authoritative and is wrong, with no signal that a fallback occurred. **An
honest failure beats a second sum that could silently disagree.**

**Consequence:**

- The hint exists because the financial summary endpoint *has* a listing sibling that
  can answer the same question. Packages without such a route get a plain timeout
  error and no hint — inventing one would point an agent nowhere. This is why PR #11
  added no hints when porting the timeout to the other seven packages.
- This generalizes beyond totals: where the server owns a computation, these packages
  are a transport for it, not a second implementation of it.
- The recovery path is deliberately routed **through the model**, not hidden inside
  the tool. The agent is told what failed and what to try, which keeps the fallback
  visible in the transcript.

**Status:** Active.
