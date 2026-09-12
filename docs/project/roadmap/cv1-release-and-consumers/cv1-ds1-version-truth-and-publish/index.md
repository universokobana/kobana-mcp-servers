[< Parent](../index.md)

# CV1.DS1 — Version truth and the first deliberate publish

**Status:** 🟡 Planned
**Type:** Technical Story

---

## Technical Story

In order to make a merged fix actually reach the people running these packages,
As the maintainers of ten independently published npm packages,
I want one version authority per package, asserted by a test, and a publish that
carries the two fixes currently stranded on `main`,
So that consumers stop running artifacts we know to be defective, and the handshake
tells them the truth about what they are running.

## Outcome

Every package reports its real version from a single authority, and the versions on
npm carry the PSQ-001 stateless-HTTP fix and the timeout fence. `kia-desktop`'s
override of our built files becomes deletable.

## Acceptance Behavior

```text
Given a package whose package.json declares version X
When an MCP client completes the initialize handshake
Then serverInfo.version reports X, not a hardcoded literal

Given a package whose package.json declares version X
When the client sends any request to the Kobana API
Then the User-Agent reports X

Given the repository at any commit
When the version lockstep test runs
Then it fails if any hardcoded version literal disagrees with package.json

Given the published packages after this story
When a consumer installs kobana-mcp-<pkg> from npm
Then the artifact contains the stateless HTTP transport and the timeout fence,
     and does not contain the SSE transport or a Math.random() session id
```

## Scope

- Replace the 37 hardcoded version literals across all ten packages with a value read
  from each package's own `package.json`.
- A test asserting lockstep between `package.json` and every runtime-reported version.
- Version bumps for the fixes already on `main` but unpublished.
- Publish all ten packages.
- Per-package `CHANGELOG.md` entries stating plainly what was stranded and for how
  long (MD-006 item 4).
- Delete `kia-desktop`'s override directory and verify its build (cross-repo follow-up,
  tracked as [TD-007](../../technical-debt-ledger.md)).

## Out Of Scope

- The tag-driven release workflow — that is CV1.DS2. This story publishes **manually
  and deliberately**, which is also the honest way to learn what the workflow must
  automate.
- Fencing `mcp-help` and `mcp-site` (TD-002, TD-003) — they need their own timeout
  budgets, and bundling a behavior change into a release-correctness story would blur
  what the publish contains.
- Consolidating lockfiles or the `workspaces` list (CV3.DS4).
- A public security advisory — that is a **Navigator decision**, raised in
  [`plan.md`](plan.md).

## Validation

Automated: the lockstep test, plus typecheck and build across all ten packages.

Manual: unpack each published tarball and confirm the fixed transport is present and
the vulnerable one is absent; run one package over stdio and inspect the handshake;
rebuild `kia-desktop` with its override removed.

See [`test-guide.md`](test-guide.md).
