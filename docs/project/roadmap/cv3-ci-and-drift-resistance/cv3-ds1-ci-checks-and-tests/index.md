[< Parent](../index.md)

# CV3.DS1 — CI gate: `Checks` and `Tests`

**Status:** 🟡 Planned
**Type:** Technical Story

---

## Technical Story

In order to stop relying on whoever happens to run the right commands before integrating,
As the maintainers of a repository with no workflows and no branch protection,
I want two reporting CI jobs named `Checks` and `Tests` running on pull requests and on
pushes to `main`,
So that a change that breaks typecheck, build or the suite is visible without a human
remembering to look.

## Outcome

Every pull request and every push to `main` reports two status checks. The gate is
visible; per [MD-004](../../../decisions/md004-no-branch-protection/index.md) it reports
rather than blocks.

## Why now

Two facts changed since the roadmap was written:

1. **Tests exist.** [CV1.DS1](../../cv1-release-and-consumers/cv1-ds1-version-truth-and-publish/index.md)
   added 90 assertions. Before that, a CI gate would have run typecheck against nothing
   much.
2. **Direct pushes to `main` are happening.** Commits `2b57670` and `c8ea7d6` went
   straight to `main` without a pull request — legitimate under MD-004, and precisely why
   `pull_request` alone would leave a hole.

It also lands **green on the first run**: typecheck is clean across all ten packages and
90 tests pass as of `c8ea7d6`. A gate that arrives red teaches people to ignore it.

## Acceptance Behavior

```text
Given a pull request against main
When CI runs
Then a check named `Checks` reports typecheck and build across all ten packages
 And a check named `Tests` reports the vitest suite

Given a direct push to main
When CI runs
Then both checks report on the commit

Given a change that breaks typecheck in any package, including the two outside `workspaces`
When CI runs
Then `Checks` fails

Given a change that breaks an assertion
When CI runs
Then `Tests` fails
```

## Scope

- One workflow, `.github/workflows/ci.yml`, with jobs named exactly `Checks` and `Tests`.
- Triggers: `pull_request` and `push` to `main`.
- Coverage of **all ten** packages, including `mcp-help` and `mcp-site`, which sit outside
  `workspaces` and need their own install
  ([TD-006](../../technical-debt-ledger.md), [TD-010](../../technical-debt-ledger.md)).
- Dependency caching keyed on every lockfile in the repository.
- A `README` badge, so the gate is visible without opening the Actions tab.

## Out Of Scope

- **Branch protection.** MD-004 stands; these checks report. Naming them `Checks` and
  `Tests` means a future ruleset needs no rename.
- **The dependency audit** — CV3.DS3, deliberately off the pull-request path.
- **Lint and formatting** — CV3.DS2. Adding Prettier here would mean one mechanical
  reformat of the whole repository inside a workflow story, which would bury it.
- **Fixing TD-006/TD-010 structurally.** This story *works around* the split install; the
  consolidation is CV3.DS4.
- **Deciding the supported Node range.** The story surfaces the conflict (see the plan)
  and records it as debt; changing `engines` or deleting the Node 18 branch is a
  compatibility decision, not a CI decision.

## Validation

`Checks` and `Tests` both green on the pull request that introduces them, and both
reporting on the subsequent push to `main`. Then a deliberate break of each, verified red,
and reverted — a gate nobody has seen fail is not a verified gate.

See [`test-guide.md`](test-guide.md).
