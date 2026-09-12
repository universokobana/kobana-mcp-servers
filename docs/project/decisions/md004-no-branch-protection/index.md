[< Decisions](../index.md)

# MD-004 — No branch protection on `main` for now; the gate is local

**Date:** 2026-09-12
**Origin:** Ariad adoption. Taken after verifying the actual rule state of the three
repositories rather than assuming it.

---

**Context:** the sibling repositories were surveyed with
`gh api repos/universokobana/<repo>/rules/branches/main`, which reports inherited
organization rules as well as repository-level ones:

| Repository | Rules on `main` |
|---|---|
| `kobana-mcp-servers` | **none** |
| `kia-backend` | deletion, non_fast_forward, required_linear_history, required_signatures, copilot_code_review, pull_request, required_status_checks (`Checks` + `Tests`, strict), 1 approval |
| `kia-desktop` | **none** |

Every rule on `kia-backend` reports `ruleset_source_type: Repository` — it is
repository-level, not inherited. There is no organization ruleset reaching these
repositories, so the `Checks`/`Tests` job names that `kia-backend`'s `CLAUDE.md`
describes as "a contract" are a contract **in that repository only**.

**Decision:**

- **(1) No ruleset is added to this repository for now.** No required checks, no
  required approval, no signature requirement.
- **(2) The quality gate is the local one** — run the checks before integrating.
  This matches `kia-desktop`, which also has no protection and relies on a local
  pre-push gate.
- **(3) CI will report, not block.** [CV3.DS1](../../roadmap/cv3-ci-and-drift-resistance/index.md)
  still names its jobs `Checks` and `Tests`, so that if this repository is ever
  brought under a ruleset, no rename is needed and no required check hangs pending.

The reasoning is proportionality. This is effectively a solo repository; a required
approval mostly produces self-merge friction, and a required check on a repository
with no tests yet gates on very little. The decision is explicitly revisitable.

**Consequence:**

- `main` is unprotected: a force-push or a direct push can rewrite it. Accepted.
- The two pull requests merged on 2026-09-12 (#10, #11) were unreviewed and
  unsigned. Under `kia-backend`'s ruleset neither would have merged. That is named
  here rather than left as an accident.
- **Revisit when:** a second regular contributor appears, or a bad publish reaches
  `kadu` (which consumes latest from npm with no pin, so it has no rollback other
  than publishing forward — see
  [CV1](../../roadmap/cv1-release-and-consumers/index.md)).

**Status:** Active.
