[< Roadmap](../index.md)

# CV1 — Consumers can receive fixes

**Status:** 🟢 Active

---

## Capability Value

A fix merged into `main` reaches the packages' consumers through a deliberate,
repeatable release, and each consumer can tell which version carries it.

Today none of that holds. This CV closes the gap between "merged" and "delivered".

## Why this is first

Two consumers depend on these packages in opposite ways, and neither is served by
the current state:

| Consumer | How it consumes | What the missing release path costs it |
|---|---|---|
| `kia-desktop` | pins exact versions, vendors the tree into a signed Tauri bundle with `--ignore-scripts` | Carries a **committed override** of this repository's `dist/` files for the financial timeout, because publishing "was not on our timeline". Its own version guard will fail the build the moment a real publish lands — by design |
| `kadu` | `npx -y kobana-mcp-*` for seven packages | Always takes latest from npm. An unpublished fix reaches it **never**; a bad publish reaches it **instantly**, and there is no pin to roll back to |

Concrete drift at adoption time:

- `mcp-admin` and `mcp-charge`: `1.1.0` local, `1.0.1` published.
- The timeout fence merged 2026-09-12 (`f4870e3`, `7822808`): **no version bump**, so
  no consumer can receive it.
- `serverInfo.version` is hardcoded `1.0.0` in `server.ts` and twice in
  `http-server.ts`, plus the `User-Agent`, while `package.json` reads `1.2.0` —
  a consumer inspecting the handshake is told the wrong version.

## Candidate Stories

| Code | Story | Type | Outcome | Status |
|------|-------|------|---------|--------|
| [CV1.DS1](cv1-ds1-version-truth-and-publish/index.md) | Version truth and first deliberate publish | Technical Story | One version authority per package, asserted; the merged timeout fence published and reaching both consumers | 🟢 Active |
| CV1.DS2 | Release workflow on tags | Technical Story | `npm publish --provenance` driven by per-package tags from CI, not a laptop | ⚪ Candidate |
| CV1.DS3 | Per-package changelogs | Technical Story | Each package documents its own versions; the root CHANGELOG stays repo-level as it declares | ⚪ Candidate |

## Done Condition

A fix can go from merged to consumed without a human remembering a sequence of
commands, both consumers can name the version they run, and `kia-desktop`'s override
directory is deleted rather than tolerated.
