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
| Local Node is **25.9.0 from Homebrew**, not mise-managed | `readlink -f $(which node)` → `/opt/homebrew/Cellar/node/25.9.0_2/…`; no `.nvmrc`/`.node-version` exists |

### Clean-clone rehearsal (2026-09-12, after panel review)

The first draft asserted "lands green on the first run" from a working tree that already
had `node_modules` everywhere. The devops review called that a memory rather than a fact,
so the exact recipe was rehearsed in a **fresh clone** of this branch — no `node_modules`,
nothing warm:

| Step | Result |
|---|---|
| root `npm ci` | ✅ |
| `mcp-help` `npm ci` — **never exercised anywhere before** | ✅ exit 0 (feared stale lockfile did not materialise) |
| `mcp-site` `npm ci` | ✅ exit 0 |
| typecheck × 10, fail-hard form | ✅ all ten clean |
| build × 10 | ✅ |
| `npm test` | ✅ 90 passed |
| `git diff -- '*/dist/'` after a clean build | ✅ **0 files** — the tracked artifacts are currently in sync with `src/` |

So green-on-arrival is now verified, and the last row makes DD8 viable today rather than
aspirational.

**Risks:**

1. **A workflow that is red on arrival** trains people to ignore it. Mitigated by the
   facts above: it lands green, and the story verifies red only through deliberate,
   reverted breakage.
2. **The split install (TD-010) is the most likely cause of a day-one red.** A naive
   `npm ci` + `npm run build` skips `mcp-help`/`mcp-site` entirely, so their breakage
   would pass silently — worse than red.
3. **Self-hosted runners would be a security mistake here.** See DD1.
4. **A gate that cannot fail.** The first draft of the test guide carried
   `... || echo "FAILED: $p"` as "exactly what the workflow will run". `echo` returns 0, so
   the loop exits 0 and the step passes **on a broken package**. Caught by the QA review
   before it reached a workflow file; the fail-hard form is now specified in DD7 and used
   in the guide.

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

**DD7 — The workflow's non-obvious hygiene, specified rather than left to whoever types the
YAML.** All of these came out of the panel review:

- **The typecheck loop must fail hard.** A collecting flag and an explicit `exit 1`, never
  `|| echo`. This is the single most important line in the workflow: it is the difference
  between a gate and a decoration.
- **Action references pinned to a major tag** (`actions/checkout@v5`, `actions/setup-node@v5`),
  matching `kia-backend`'s practice. A floating reference on a public repository is supply
  chain the maintainer does not control.
- **`timeout-minutes` on both jobs.** The default is six hours; a hung `npm ci` should not
  hold a runner that long. 15 is generous for a job whose real work is ~2 minutes.
- **`concurrency` group per ref, `cancel-in-progress` for pull requests only.** A force-push
  to a PR branch should cancel the stale run; a push to `main` should not cancel its own
  history.
- **`.nvmrc` holding `24`**, consumed by `setup-node`'s `node-version-file`, so the version
  lives in one place instead of inside the YAML. Node 24 is the active LTS and is inside
  vitest's supported range.

  *Named consequence:* local Node here is **25.9.0 from Homebrew**, which `.nvmrc` does not
  govern — so this does **not** silently switch the dev shell, and it does **not** eliminate
  the 25-vs-24 drift. What it does is make the drift visible and the expectation explicit,
  which is what turns "green locally, red in CI" from mysterious into diagnosable. Pinning
  the version inline in the workflow instead would work equally well and touch nothing else;
  `.nvmrc` is preferred only because contributors and CI then read the same file.

**DD8 — Guard the tracked `dist/` against drift, with one line.** Three packages commit their
built output ([TD-013](../../technical-debt-ledger.md)). CI checks those artifacts out, builds
over them, and tests the fresh build — so a `src/` change committed without a rebuild would
leave `main` carrying a stale artifact that nothing flags. `git diff --exit-code -- '*/dist/'`
after the build closes it.

Verified viable: the clean-clone rehearsal shows **0 changed files** after a full build, so
this lands green rather than immediately red. The step is annotated to be **deleted** when
TD-013 untracks those directories — at which point it becomes meaningless, not merely
redundant.

**DD6 — Cache keyed on every lockfile.** `cache-dependency-path` lists the root lockfile
plus all nine per-package ones, so a change in any of them invalidates correctly. The nine
lockfiles are themselves TD-005; the cache key should collapse to one line when that is
fixed, and the workflow says so.

## Implementation Approach

1. `.nvmrc` containing `24` (DD7).
2. `.github/workflows/ci.yml` — the two jobs, with comments carrying the *why* for DD1,
   DD4, DD5 and DD8, since those are the non-obvious ones. Fail-hard typecheck loop.
3. A status badge in `README.md`, with a line next to it saying **what the gate covers** —
   typecheck, build, and version-lockstep assertions — and what it does not: there is no
   behavioral coverage until [CV2](../../cv2-test-infrastructure/index.md). A bare
   "CI passing" badge on a public repository reads as "it works" to a stranger, and today
   that would be an overclaim.
4. Push the branch, open the pull request, confirm both checks run and pass.
5. **Verify the gate fails — on a throwaway branch, not this one.** Three deliberate breaks,
   each confirmed red, captured as **run URLs** in the test guide. Rationale: this repository
   merges by rebase, so break-and-revert commits on the story branch would land on `main`
   permanently and leave a future bisect sitting on a commit that is deliberately broken.
   The evidence is worth keeping; its location is not. The throwaway branch is deleted after
   the URLs are recorded.
6. Confirm both checks also report on the merge commit to `main` (DD3).
7. Record the Node-18 conflict in the debt ledger.

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

Both were reviewed by the devops-engineer and quality-assurance lenses on 2026-09-12 and
**both lenses converged on them as drafted**. The review's seven objections are resolved in
this revision: the fail-hard loop (DD7) and the deliberate-red location (step 5) were the
two that mattered; `.nvmrc`, pinned actions, `timeout-minutes` and `concurrency` are DD7;
the `mcp-help` probe and the badge wording are in the guide and step 3; the tracked-`dist/`
question is answered by DD8 rather than deferred.

One residual item needs a decision rather than a fix: **`.nvmrc` versus an inline
`node-version`** (DD7). `.nvmrc` is preferred here, and the consequence is named — it does
not govern this machine's Homebrew Node, so it documents the expectation without changing
the dev shell.
