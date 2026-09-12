[< Decisions](../index.md)

# MD-005 — The duplicated `KobanaApiClient` stays duplicated for now

**Date:** 2026-09-12
**Origin:** Ariad adoption, immediately after PR #11 ported the same timeout fix into
seven packages.

---

**Context:** eight packages carry near-identical copies of `KobanaApiClient`. The
2026-08-24 timeout incident therefore required the same patch eight times. The port
was only safe because the seven target regions were *proved* byte-identical first
(`config.ts` identical to financial's pre-fix version; the patched region of
`client.ts` identical across all seven) and applied by a script whose every
replacement was an assertion, so drift would abort rather than half-apply.

The obvious fix is a shared `core` package consumed as a workspace dependency. It is
not a free chore, because of how the packages are consumed: `kia-desktop` installs
them from a committed lockfile with `--ignore-scripts` into
`src-tauri/resources/mcp-packages/node_modules`, producing a byte-reproducible tree
that ships inside a signed application bundle. A shared dependency has to either be
published as its own package or be bundled into each package's `dist/`, and that
path has not been analyzed.

**Decision:** the duplication stays. No `core` package is extracted now.

Two consequences are accepted deliberately, and one is explicitly *not*:

- **Accepted:** a future client fix pays the same port ritual — prove the regions
  identical, apply by asserting script, typecheck every package.
- **Accepted:** the duplication is recorded as
  [TD-001](../../roadmap/technical-debt-ledger.md), not forgotten.
- **Not accepted:** duplicating the *tests*. This decision constrains
  [CV2](../../roadmap/cv2-test-infrastructure/index.md): the test suite is
  parametrized over packages — one contract factory, each package importing its own
  client — so eight runtime copies do not become eight test copies. Deduplicating at
  the test layer costs nothing at runtime and changes no published artifact.

**Note on DRY.** This decision sits in tension with the DRY principle in the
[engineering principles](../../engineering-principles.md). The tension is real and is
named there rather than hidden: the principle says build the abstraction *and adopt
it*, and what is deferred here is the abstraction, not the recognition that the
duplication is debt.

**Revisit when:** a third fix needs the eight-way port, or the `kia-desktop`
vendoring path has been analyzed and the bundling question answered.

**Status:** Active.
