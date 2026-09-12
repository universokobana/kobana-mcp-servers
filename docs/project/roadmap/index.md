# Roadmap — Kobana MCP Servers

Ariad-governed roadmap for **`kobana-mcp-servers`** — the public monorepo of Model
Context Protocol servers for the Kobana API v2, published independently on npm and
consumed by Kobana's AI surfaces.

Adopted 2026-09-12; see the [adoption registry](ariad-adoption.md).

## How to read this roadmap

Three levels, top down:

- **CV (Capability Value)** — the top grouping; each CV has its own folder and index.
- **Delivery Story** — a coherent, demoable delivery, listed in its CV's index table
  (open = candidate to pull; completed = compact history). Code and folder use the
  `CVn.DSm` notation.
- **User Story / Technical Story** — implementable children, materialized by
  Pull/Expand inside the Delivery Story folder.

**Language:** English throughout, including prose — this repository is public. See
the [adoption registry](ariad-adoption.md#language) for why this diverges from the
Kia repositories.

Legend: ✅ done · 🟢 active · ⚪ planned · 🔬 spike · ⏸ paused

## What governs: this repository has consumers, and they cannot reach it

The ordering below is not a preference — it follows the evidence gathered on
2026-09-12.

This is a **library**, not an application. The practices that matter most are
therefore not the same ones that matter in `kia-backend` or `kia-desktop`. A test
suite protects us; a working release path protects everyone downstream. Today the
release path is the broken one:

- `kia-desktop` **committed an override** of this repository's built files because it
  could not wait for a publish.
- `kadu` runs seven packages through `npx -y`, so it consumes **whatever is latest on
  npm** — meaning an unpublished fix reaches it never, and a bad publish reaches it
  instantly with no pin to fall back to.
- Two packages (`admin`, `charge`) sit at `1.1.0` locally and `1.0.1` on npm. The
  timeout fix merged on 2026-09-12 carries **no version bump at all**, so from every
  consumer's point of view it has not happened.

That is why CV1 is release, not tests. CV2 and CV3 follow because a release path you
cannot verify is only half a fix.

## Capability Values

| Code | Capability Value | Status |
|------|------------------|--------|
| [CV1](cv1-release-and-consumers/index.md) | Consumers can receive fixes | 🟢 Active |
| [CV2](cv2-test-infrastructure/index.md) | Changes are provable | ⚪ Planned |
| [CV3](cv3-ci-and-drift-resistance/index.md) | The codebase resists drift | ⚪ Planned |

## Radar

Work that is real but not yet pulled into a CV. Named here so it does not become
drift; see also the [technical debt ledger](technical-debt-ledger.md).

| Item | Why it is waiting |
|---|---|
| Fence `mcp-help` and `mcp-site` against unbounded hangs | Both are consumed by `kadu` today, so the hang class remains live. Each needs its own timeout budget rather than inheriting 30s — `mcp-site` downloads a ZIP where 30s would false-positive on a slow but healthy transfer ([TD-002](technical-debt-ledger.md), [TD-003](technical-debt-ledger.md)) |
| Shared `core` package for the duplicated client | Deliberately deferred by [MD-005](../decisions/md005-client-duplication-accepted/index.md). Revisit when a third fix has to be ported eight times, or when the vendoring path for `kia-desktop` has been analyzed |
| Consolidate the nine per-package lockfiles | Contradicts npm workspaces and is the likely reason GitHub reports 532 advisories where the root tree reports 7 ([TD-005](technical-debt-ledger.md)) |
| Bring `mcp-help` and `mcp-site` into the workspaces list | They are outside it today, so the root build skips them entirely ([TD-006](technical-debt-ledger.md)) |
| Tool-surface change discipline | 117 of the 122 tools in `kia-desktop`'s eval field catalog originate here. A description edit is a behavior change measured downstream; the practice for it is stated in the [engineering principles](../engineering-principles.md) but has no gate |

## Related documents

- [Engineering principles](../engineering-principles.md) — the rulebook every story's
  Definition of Done refers to
- [Development guide](../../process/development-guide.md) — how work moves
- [Decision registry](../decisions/) — `MD<n>`
- [Refinement Workbench](../refinement/) — `RS<n>` / `CR<n>`
- [Technical debt ledger](technical-debt-ledger.md) — `TD<n>`
- [`AGENTS.md`](../../../AGENTS.md) — workflow authority and integration gates
