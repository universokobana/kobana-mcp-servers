# Ariad Adoption

This project is governed by Ariad-driven Builder Mode since **2026-09-12**.

## Method state

- method adopted: **ariad** (journey `kobana-mcp-servers`)
- cadence profile: **checkpoint** (stop at method checkpoints, not after every phase)
- Navigator flow unit: `story_by_story` (default)
- delivery cursor: synchronized; no active item at adoption time
- last delivery event: `template_preparation`

## Context — why this repository adopts Ariad now

Until 2026-09-12 this repository had **no process substrate at all**: no tests, no
CI workflows, no branch rules, no decision registry, and no release procedure. Two
pull requests were merged on 2026-09-12 gated by nothing but `tsc --noEmit` run on
a laptop. That is not a criticism of the code — the packages work and are in
production use — but it is an honest statement of where the practice stood.

The trigger was a live incident and what it revealed downstream. On 2026-08-24 the
financial statement `/summary` endpoint accepted requests and never completed
them; because `KobanaApiClient` had no timeout, two `summarize` calls hung past the
calling client's 125s watchdog and killed entire agent turns. Fixing it exposed
three structural facts:

1. **The same unfenced client was copy-pasted across eight packages.** One incident
   required the same patch eight times.
2. **Consumers had no way to receive the fix.** `kia-desktop` could not wait for an
   upstream publish and committed an override of this package's `dist/` files into
   its own Tauri bundle. A downstream repository patching around us is the clearest
   possible signal that the release path was missing.
3. **Two consumers depend on this repository in opposite ways.** `kia-desktop` pins
   exact versions and vendors them; `kadu` runs seven packages through `npx -y`,
   always taking whatever is latest on npm. Neither was served by an unpublished
   `main`.

A fourth fact emerged while surveying the sibling repositories: **117 of the 122
tools** in `kia-desktop`'s eval field catalog come from this repository, with names,
descriptions and parameters carried verbatim. The tool surface authored here is the
substrate of another repository's model-behavior measurements. Editing a tool
description is therefore a behavior change, not a copy tweak.

Ariad is adopted to make that kind of change deliberate, planned and verified.

## What changed on disk

- New Ariad tree in `docs/project/roadmap/`:
  - [`index.md`](index.md) — the living roadmap; three CVs.
  - `cv1-release-and-consumers/` — active CV; the release path consumers depend on.
  - `cv2-test-infrastructure/` — planned CV; there are no tests today.
  - `cv3-ci-and-drift-resistance/` — planned CV; there are no workflows today.
  - [`technical-debt-ledger.md`](technical-debt-ledger.md) — seeded from the
    2026-09-12 survey rather than left as drift.
  - `templates/` — Ariad story package templates, imported from `kia-backend` and
    adapted (see "Imported artifacts" below).
- New [decision registry](../decisions/) with prefix **MD**, seeded retroactively
  with five decisions this repository had already made in code and commit messages
  but never recorded.
- New [engineering principles](../engineering-principles.md) — derived from the Kia
  principles, not copied; see that document's provenance note.
- New [development guide](../../process/development-guide.md) — adapted from
  `kia-backend`.
- `AGENTS.md` is now the workflow authority; `CLAUDE.md` points at it, so the two
  runtimes read one source instead of two that drift.
- `docs/instructions.md` and `docs/implementation-plan.md` moved to `docs-legacy/`.
  They are the original generation prompt and its plan — the provenance of the
  codebase, not process. They are preserved, not deleted.

## Language

**English throughout**, including roadmap prose.

This diverges deliberately from `kia-backend` and `kia-desktop`, whose roadmap prose
is pt-BR. The reason is visibility: those repositories are internal, this one is
**public** and published on npm. Its documentation is read by people outside the
company, so its working language is English — consistent with the README, CHANGELOG
and SECURITY files that already were.

Ariad's machine anchors are English in every repository regardless: the
`**Status:**`/`**Type:**` labels, the status vocabulary (`Done`, `Active`,
`Planned`, `Blocked`, `Candidate`, `Future`), Type values (`User Story` /
`Technical Story`), the CV table header (`| Code | Capability Value | Status |`),
heading shape (`# CODE — Title`), and file names.

## Cross-repository citation rule

This repository is public; the Kia repositories are internal. Decisions owned by
those registries (`D<n>` in `kia-desktop`, `BD<n>` in `kia-backend`) are cited
**by bare code only, never by URL**. A link into an internal repository 404s for
outside readers and leaks internal structure. Where the context matters to an
outside reader, restate it in prose here instead of linking.

## Imported artifacts

| Artifact | Source | Adaptation |
|---|---|---|
| Story package templates | `kia-backend/docs/project/roadmap/templates/` | Already English. `plan.md`'s decision-label note rewritten for the `MD` prefix; its link to an internal Kia decision removed per the citation rule; the reference to `scripts/linkify-references.py` dropped (that gate does not exist here yet) |
| Development guide | `kia-backend/docs/process/development-guide.md` | Translated to English; Prisma/deploy/database sections dropped; release-and-publish sections added |
| Engineering principles | `kia-desktop/docs/project/engineering-principles.md` | Derived, not copied — translated and reduced; see its provenance note for the section-by-section verdict |

## Conventions from here on

- New Delivery/User/Technical Stories are born through the Ariad lifecycle under
  `docs/project/roadmap/`, from the templates.
- Maintenance and hardening that does not move the roadmap enters as Change
  Requests (CR) grouped into Refinement Stories (RS) under
  [`docs/project/refinement/`](../refinement/).
- Decisions are recorded as `MD<n>` in [`docs/project/decisions/`](../decisions/)
  at the moment they are taken, not reconstructed later.
- Technical debt found during Review is named in the
  [ledger](technical-debt-ledger.md).

## Known gap at adoption

The Ariad tree is process substrate; it does not by itself add a single test or
workflow. CV2 and CV3 exist precisely because adopting the method does not
retroactively make the codebase verified. Nothing in this adoption should be read
as "the practice gap is closed" — it is named, sequenced and now visible.
