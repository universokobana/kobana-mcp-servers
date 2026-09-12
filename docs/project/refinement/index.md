[< Project](../roadmap/index.md)

# Refinement Workbench

Not all legitimate work is a roadmap Delivery Story. Ongoing hardening,
consolidation, cleanup and point fixes enter here as **Change Requests (CR)**,
grouped into **Refinement Stories (RS)**.

Use Refinement Work when the work is real but does not move the roadmap. Do not
inflate maintenance into a CV or Delivery Story just to make it visible — and do not
hide product delivery inside a CR to skip the lifecycle.

## Refinement Stories

| Code | Refinement Story | Status |
|------|------------------|--------|
| — | none yet | — |

## Note on the work that preceded adoption

Two changes were integrated on 2026-09-12 before this workbench existed:

- **PR #10** (`f4870e3`) — the per-request timeout fence in `mcp-financial`.
- **PR #11** (`7822808`) — the same fence ported to the remaining seven packages.

Under Ariad the second would have been a Technical Story with an approved `plan.md`
and a `test-guide.md`; the first was an incident response, which the method would
have routed as a CR. They are **not retro-converted** — inventing story packages
after the fact would fake a lifecycle that did not happen. They are named here so the
history reads honestly, and their durable content lives where it belongs: the
decisions in [MD-003](../decisions/md003-summary-endpoint-is-the-only-aggregation-authority/index.md)
and [MD-005](../decisions/md005-client-duplication-accepted/index.md), the debt in the
[ledger](../roadmap/technical-debt-ledger.md), and the unfinished work in the
roadmap's [Radar](../roadmap/index.md#radar).
