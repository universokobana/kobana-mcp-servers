[< Story](index.md)

# Plan — CV3.DS1 CI gate: `Checks` and `Tests`

## Pull

Pulled ahead of the rest of CV3, and ahead of CV2, because it is the cheapest story that
makes every later story machine-verified — and because it can be **completed and verified
today**, which [CV1.DS2](../../cv1-release-and-consumers/index.md) cannot while there are
no registry credentials.

Technical Story: no consumer-visible behavior changes.

## Prepare

**Established facts** (verified, not assumed):

| Fact | Evidence |
|---|---|
| No workflows exist | `.github/` is absent |
| The `gitStream.cm` check is external and inert here | It reported `skipping` on PRs #10, #11 and #12 |
| No rules on `main`, at org or repo level | `gh api repos/universokobana/kobana-mcp-servers/rules/branches/main` → `[]` (MD-004) |
| Direct pushes to `main` happen | `2b57670`, `c8ea7d6` |
| The gate would land green | typecheck clean ×10; 90 tests pass at `c8ea7d6` |
| `mcp-help` / `mcp-site` are outside `workspaces` and have their own lockfiles | root `package.json`; `mcp-{help,site}/package-lock.json` |
| `mcp-site` cannot compile without its own install | TD-010 — `env-paths`/`adm-zip` unresolved; fails identically on `main` |
| `npm test` needs a prior build | The suite asserts on `dist/`, by design — verifying only `src/` would repeat the bug CV1.DS1 fixed |
| The repository is **public** | `gh repo view --json visibility` → `PUBLIC` |
| vitest 4 supports Node `^20 \|\| ^22 \|\| >=24` | `node_modules/vitest/package.json` `engines` |
| The packages promise Node `>=18` | `engines` in every `mcp-*/package.json` |

**Risks:**

1. **A workflow that is red on arrival** trains people to ignore it. Mitigated by the
   facts above: it lands green, and the story verifies red only through deliberate,
   reverted breakage.
2. **The split install (TD-010) is the most likely cause of a day-one red.** A naive
   `npm ci` + `npm run build` skips `mcp-help`/`mcp-site` entirely, so their breakage
   would pass silently — worse than red.
3. **Self-hosted runners would be a security mistake here.** See DD1.

## Scope / Non-Goals

As stated in [`index.md`](index.md#scope).

## Design Decisions

**DD1 — GitHub-hosted runners, not the self-hosted `kobana-runners`.** `kia-backend` runs
its CI on self-hosted ARC runners, and copying that here would be actively unsafe: this
repository is **public**, so a pull request from any fork would execute attacker-authored
code on Kobana infrastructure. `ubuntu-latest` it is. The runner-economy reasoning in
`kia-backend`'s workflow (grouping checks to avoid pod queue costs) does not transfer
either — GitHub-hosted minutes are free for public repositories, so jobs can be split for
clearer signal.

No secrets are referenced by this workflow, and `permissions` is `contents: read`, so a
fork pull request gains nothing by running it.

**DD2 — Two jobs, matching the `Checks`/`Tests` names.** MD-004 item 3: the names are
chosen for contract-compatibility with `kia-backend`'s ruleset, so that if this repository
is ever brought under protection, nothing needs renaming and no required check hangs
pending forever.

`Checks` = typecheck + build. `Tests` = build + vitest. **The build runs in both**, which
is deliberate duplication: each job must be independently meaningful and independently
re-runnable, and `Tests` cannot run without `dist/`. On free runners the duplicated build
costs nothing worth optimizing.

**DD3 — Both triggers.** `pull_request` and `push` to `main`. Under MD-004 `main` accepts
direct pushes, and two already happened today — `pull_request` alone would leave exactly
the path the maintainer actually uses uncovered.

**DD4 — Install all ten packages explicitly.** Root `npm ci` covers the eight workspaces;
`mcp-help` and `mcp-site` each get their own `npm ci`. Without this the two packages are
invisible to CI, which is the failure mode described in risk 2. The step is annotated in
the workflow with a pointer to TD-006/TD-010 so that whoever consolidates the workspaces
knows to delete it.

**DD5 — One Node version now (24), and the Node 18 conflict recorded rather than
resolved.** The packages declare `engines: >=18`; vitest 4 cannot run on 18. Worse,
`isTimeoutAbort` carries a branch that exists *only* for Node 18 — it matches `AbortError`
because older undici raised that instead of `TimeoutError` — so the branch cannot be
covered by the suite on the runtime it was written for. Confirmed locally: Node 25 raises
`TimeoutError`.

Three options were considered:

- a **matrix** including an 18 leg that runs typecheck and build only — buys compile
  assurance, still no behavioral coverage of the branch;
- **narrowing `engines` to `>=20`** and deleting the `AbortError` branch — likely correct,
  since Node 18 reached end of life in April 2025, but that is a **compatibility decision
  affecting published packages**, not a CI decision;
- **one version now**, with the conflict named.

Taking the third. Smuggling a supported-runtime change into a workflow story would hide a
decision that deserves its own record. Recorded as new debt, with the recommendation that
`engines` be settled first and the CI matrix follow that decision rather than pre-empt it.

**DD6 — Cache keyed on every lockfile.** `cache-dependency-path` lists the root lockfile
plus all nine per-package ones, so a change in any of them invalidates correctly. The nine
lockfiles are themselves TD-005; the cache key should collapse to one line when that is
fixed, and the workflow says so.

## Implementation Approach

1. `.github/workflows/ci.yml` — the two jobs, with comments carrying the *why* for DD1,
   DD4 and DD5, since those are the non-obvious ones.
2. A status badge in `README.md`.
3. Push the branch, open the pull request, and confirm both checks run and pass.
4. **Verify the gate fails.** Break typecheck in one package, confirm `Checks` red; revert.
   Break one assertion, confirm `Tests` red; revert. Do this on the story branch so the
   evidence is in the pull request's own history.
5. Confirm both checks also report on the merge commit to `main` (DD3).
6. Record the Node-18 conflict in the debt ledger.

## Test Strategy

The workflow is itself the artifact under test, so validation is observational rather than
assertive: the checks must appear, pass, and be *seen to fail* for the right reasons.

No unit tests are added. The existing suite is what `Tests` runs.

## Validation Route

See [`test-guide.md`](test-guide.md). The Navigator-visible outcome is two green checks on
the pull request, plus the deliberate-red evidence recorded there.

## Checkpoint

Implementation must not start until the Navigator approves this plan.

Two points worth an explicit yes or no:

1. **DD5** — one Node version now, with the `engines: >=18` conflict recorded as debt
   rather than resolved. The alternative is to settle the supported Node range first, which
   would pause this story.
2. **DD1** — GitHub-hosted runners, deliberately diverging from `kia-backend`'s
   self-hosted setup, because this repository is public.
