[< Story](index.md)

# Test Guide — CV3.DS1 CI gate: `Checks` and `Tests`

## Local rehearsal — exactly what the workflow will run

Run this before pushing; if it is green locally and red in CI, the difference is the
environment, which is the useful signal.

```bash
# 1. Install: root covers the eight workspaces; the two outsiders need their own (DD4)
npm ci
(cd mcp-help && npm ci)
(cd mcp-site && npm ci)

# 2. Typecheck all ten
for p in mcp-*/; do (cd "$p" && ../node_modules/.bin/tsc --noEmit) || echo "FAILED: $p"; done

# 3. Build all ten (root build skips the two outsiders — TD-006)
npm run build
(cd mcp-help && npm run build)
(cd mcp-site && npm run build)

# 4. Tests (need dist/ from step 3)
npm test
```

Expected: no `FAILED:` lines, and `90 passed`.

## Observational validation — the checks appear

```bash
gh pr checks <pr-number>
gh run list --limit 5
```

**Pass condition:** two checks named exactly `Checks` and `Tests`, both `pass`.
**Fail condition:** a check named anything else — the names are a contract (DD2).

## Deliberate red — a gate nobody has seen fail is not verified

Both breakages go on the story branch so the evidence sits in the pull request's history.

```bash
# A. Break typecheck in one package — expect `Checks` red, `Tests` red too (it builds)
echo 'const broken: number = "not a number";' >> mcp-edi/src/version.ts
git commit -am "test(ci): deliberate typecheck break — verifying Checks fails" && git push
gh pr checks <pr-number>   # expect failure
git revert --no-edit HEAD && git push

# B. Break one assertion — expect `Tests` red, `Checks` green
#    (a changed version in the manifest with no changelog entry: exactly the drift
#     CV1.DS1 closed, so it is a realistic break, not a synthetic one)
npm pkg set version=9.9.9 --workspace mcp-edi
git commit -am "test(ci): deliberate assertion break — verifying Tests fails" && git push
gh pr checks <pr-number>   # expect Checks pass, Tests fail
git revert --no-edit HEAD && git push
```

**Pass condition for A:** `Checks` fails on the typecheck step.
**Pass condition for B:** `Checks` passes while `Tests` fails — which also proves the two
jobs are independent rather than one gate reported twice.

## Coverage of the two packages outside `workspaces`

The likeliest silent failure is CI passing *because it never looked* at `mcp-help` or
`mcp-site` (TD-006, TD-010).

```bash
# Break typecheck in a package outside workspaces — CI must still notice
echo 'const alsoBroken: number = "nope";' >> mcp-site/src/version.ts
git commit -am "test(ci): deliberate break in a non-workspace package" && git push
gh pr checks <pr-number>   # expect Checks red
git revert --no-edit HEAD && git push
```

**Pass condition:** `Checks` red. **If this passes green, the workflow is not covering all
ten packages** and DD4 was not implemented correctly — the most important single check in
this guide.

## Push-to-`main` coverage

After merge:

```bash
gh run list --limit 3 --branch main
```

**Pass condition:** a run against the merge commit on `main`. Under MD-004 direct pushes to
`main` are permitted and have already happened (`2b57670`, `c8ea7d6`), so a workflow that
only fires on `pull_request` would miss them (DD3).

## Navigator Validation

1. Open the pull request and confirm two checks, correctly named, both green.
2. Read the deliberate-red commits in the branch history and confirm each failed for the
   stated reason.
3. Confirm the `README` badge renders and links to the workflow.

## Validation Evidence

<Recorded after validation runs.>
