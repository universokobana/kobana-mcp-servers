[< Story](index.md)

# Test Guide — CV3.DS1 CI gate: `Checks` and `Tests`

## Local rehearsal — exactly what the workflow will run

Run this before pushing; if it is green locally and red in CI, the difference is the
environment, which is the useful signal.

**The typecheck loop must fail hard.** An earlier draft of this guide used
`... || echo "FAILED: $p"`, which cannot fail: `echo` returns 0, so the loop exits 0 and the
step passes on a broken package. Use the collecting form below, and use the same form in the
workflow (DD7).

```bash
# 1. Install: root covers the eight workspaces; the two outsiders need their own (DD4)
npm ci
(cd mcp-help && npm ci)
(cd mcp-site && npm ci)

# 2. Typecheck all ten — fail-hard
failed=0
for p in mcp-*/; do
  (cd "$p" && ../node_modules/.bin/tsc --noEmit) || { echo "FAILED: $p"; failed=1; }
done
[ "$failed" -eq 0 ] || exit 1

# 3. Build all ten (root build skips the two outsiders — TD-006)
npm run build
(cd mcp-help && npm run build)
(cd mcp-site && npm run build)

# 4. Tests (need dist/ from step 3)
npm test

# 5. The tracked dist/ in three packages must not drift (DD8 — delete when TD-013 lands)
git diff --exit-code -- '*/dist/'
```

Expected: no `FAILED:` lines, `90 passed`, and step 5 silent.

### Clean-clone rehearsal, already performed

Recorded 2026-09-12, in a fresh clone with nothing warm — this is the evidence behind the
story's "lands green on the first run" claim, which was previously only an assumption:

| Step | Result |
|---|---|
| root `npm ci` | ✅ |
| `mcp-help` `npm ci` — never exercised anywhere before | ✅ exit 0 |
| `mcp-site` `npm ci` | ✅ exit 0 |
| typecheck × 10, fail-hard | ✅ all ten clean |
| build × 10 | ✅ |
| `npm test` | ✅ 90 passed |
| `git diff -- '*/dist/'` | ✅ 0 files changed |

Repeat it with `git clone` into a temporary directory, not `git clean -fdx` on the working
tree — a clone is the closer analogue of a runner and costs nothing recoverable.

## Observational validation — the checks appear

```bash
gh pr checks <pr-number>
gh run list --limit 5
```

**Pass condition:** two checks named exactly `Checks` and `Tests`, both `pass`.
**Fail condition:** a check named anything else — the names are a contract (DD2).

## Deliberate red — on a throwaway branch, never the story branch

A gate nobody has seen fail is not a verified gate. But this repository merges by **rebase**,
so break-and-revert commits on the story branch would land on `main` permanently and leave a
future `git bisect` sitting on a commit that is deliberately broken. Run the breaks on a
throwaway branch, record the **run URLs** below as the evidence, then delete the branch.

```bash
git checkout -b throwaway/ci-red-check
```

### A. Typecheck break in a workspace package → `Checks` red

```bash
echo 'const broken: number = "not a number";' >> mcp-edi/src/version.ts
git commit -am "test(ci): deliberate typecheck break" && git push -u origin throwaway/ci-red-check
gh run list --branch throwaway/ci-red-check --limit 1
```

**Pass condition:** `Checks` fails on the typecheck step. If it passes, the loop is not
failing hard — the exact defect this guide was revised to prevent.

### B. Typecheck break in **each** package outside `workspaces` → `Checks` red

The likeliest silent failure is CI passing *because it never looked*. `mcp-help` and
`mcp-site` are both outside `workspaces` (TD-006) and both need their own install (TD-010),
so **break both** — one probe would leave the other's path unexercised.

```bash
git checkout mcp-edi/src/version.ts 2>/dev/null; git revert --no-edit HEAD

echo 'const alsoBroken: number = "nope";' >> mcp-site/src/version.ts
git commit -am "test(ci): deliberate break in mcp-site (outside workspaces)" && git push
gh run list --branch throwaway/ci-red-check --limit 1

git revert --no-edit HEAD
echo 'const alsoBroken: number = "nope";' >> mcp-help/src/version.ts
git commit -am "test(ci): deliberate break in mcp-help (outside workspaces)" && git push
gh run list --branch throwaway/ci-red-check --limit 1
```

**Pass condition:** `Checks` red for each. **If either passes green, the workflow is not
covering all ten packages** and DD4 was not implemented correctly — the most important check
in this guide.

### C. Assertion break → `Tests` red while `Checks` stays green

```bash
git revert --no-edit HEAD
npm pkg set version=9.9.9 --workspace mcp-edi
git commit -am "test(ci): deliberate assertion break" && git push
gh run list --branch throwaway/ci-red-check --limit 1
```

**Pass condition:** `Checks` passes, `Tests` fails. The pairing matters: it proves the two
jobs are independent rather than one gate reported twice.

Note this break is a **documentation-level** failure — a manifest version with no matching
changelog entry, exactly the drift CV1.DS1 closed. It is realistic, but it does not prove
`Tests` would catch a *behavioral* regression, because no behavioral test exists yet
(see the honesty note below).

### Clean up

```bash
git checkout chore/cv3-ds1-ci-gate
git push origin --delete throwaway/ci-red-check
git branch -D throwaway/ci-red-check
```

### Evidence

| Break | Expected | Run URL | Result |
|---|---|---|---|
| A — typecheck, workspace package | `Checks` red | _to record_ | |
| B1 — typecheck, `mcp-site` | `Checks` red | _to record_ | |
| B2 — typecheck, `mcp-help` | `Checks` red | _to record_ | |
| C — assertion | `Tests` red, `Checks` green | _to record_ | |

## Push-to-`main` coverage

After merge:

```bash
gh run list --limit 3 --branch main
```

**Pass condition:** a run against the merge commit on `main`. Under MD-004 direct pushes to
`main` are permitted and have already happened (`2b57670`, `c8ea7d6`), so a workflow firing
only on `pull_request` would miss them (DD3).

## Honesty note — what green actually means

`Tests` green today means **90 lockstep assertions about version strings pass**. It does not
mean these packages work: there is no behavioral coverage until
[CV2.DS1](../../cv2-test-infrastructure/index.md).

The README badge must therefore be accompanied by a line naming what the gate covers.
A bare "CI passing" badge on a public repository reads as "it works" to a stranger, and that
would be an overclaim we put in front of outside readers.

## Navigator Validation

1. Open the pull request and confirm two checks, correctly named, both green.
2. Read the four recorded run URLs above and confirm each failed for its stated reason.
3. Confirm the README badge renders, links to the workflow, and carries the scope line.
4. Confirm the throwaway branch is deleted and `main` carries no deliberate-break commits.

## Validation Evidence

<Recorded after validation runs. The clean-clone rehearsal above is already evidence; the
run URLs and the post-merge `main` run are what remain.>
