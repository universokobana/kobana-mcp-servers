# Development Guide — Kobana MCP Servers

How work moves in this repository. Adapted from `kia-backend`'s development guide at
Ariad adoption (2026-09-12), translated to English and reduced to the substrate that
exists here: no database, no deploy, no i18n.

The rulebook for *what* good work looks like is the
[engineering principles](../project/engineering-principles.md). This document is about
*how* work proceeds.

The point is not methodological purity. It is fast feedback, disciplined change, and
coherent memory.

---

## Roles

**Navigator** decides direction and what to pull. **Driver** reads, designs,
implements and verifies. In most sessions here the Navigator is the human and the
Driver is an AI agent — which is precisely why the checkpoints below are real stops
and not ceremony (see the engineering principles, §1: when AI is driving, the human is
the friction that protects the codebase).

---

## Progress taxonomy

Three levels of delivery, plus one side track.

### Value — Capability Value (CV)

The top grouping, with visible impact for a consumer or for the team. Each CV has its
own folder and index under [`docs/project/roadmap/`](../project/roadmap/index.md).

Today: CV1 release and consumers, CV2 test infrastructure, CV3 CI and drift
resistance.

### Progress — Delivery Story → User/Technical Story

A **Delivery Story** is a coherent, demoable delivery, listed in its CV's candidate
table. Notation `CVn.DSm`.

A **User Story** or **Technical Story** is the implementable child, materialized by
Pull/Expand inside the Delivery Story folder. This is the normal unit of
implementation. Most work here is a *Technical* Story: this repository has no UI, and
its "user" is usually another program.

Each gets a package from the [templates](../project/roadmap/templates/):

- `index.md` — outcome and scope;
- `plan.md` — design, trade-offs and boundaries;
- `test-guide.md` — verification steps;
- `review.md` / `coherence.md` — when review produces a note or deferred debt.

### Refinement Work — RS and CR

Not all legitimate work is a roadmap Delivery Story. Ongoing hardening, consolidation,
cleanup and point fixes enter as **Change Requests (CR)** grouped into **Refinement
Stories (RS)** in the [Workbench](../project/refinement/index.md).

Use Refinement Work when the work is real but does not move the roadmap. Do not
inflate maintenance into a CV to make it visible — and do not hide delivery inside a
CR to skip the lifecycle.

### Work — task and maintenance

The concrete mutation: edit a file, add a test, update a decision, bump a dependency.
Almost always inside a story or CR.

---

## Opening ritual

At the start of every non-trivial session, the Driver answers three questions and
shares the answer when it affects the route:

1. **Are we stuck on ambiguity?** If so, expand: read, separate concerns, name
   options, clarify scope.
2. **Are we lost in fragments?** If so, collapse: relate the parts, update status,
   synthesize, name the value.
3. **Is the work flowing?** If so, continue the current phase without forcing a new
   move.

---

## Before writing code

For non-trivial delivery work, design first:

1. The Driver reads the relevant code and docs. **The code is the source of truth for
   behavior**, not the docs — and in this repository that is emphatic, since the docs
   were nearly absent before adoption.
2. The Driver identifies the level: Value, Progress, Refinement or Work.
3. The Driver decides whether it belongs to the roadmap or the Workbench, and explains
   the choice.
4. The Driver writes or updates the story's `plan.md`.
5. The Driver presents the plan and **waits for Navigator confirmation**.

If the direction is unclear, stop and ask. Guessing is not rhythm.

---

## Story lifecycle (Ariad)

`Pull` → `Prepare` → `Expand` → `Plan` → `Implement` → `Validate` → `Debt Review` →
`Done`

### 1. Pull and Prepare

The Navigator explicitly chooses what to pull — candidates do not start themselves.
`Prepare` reads the terrain: docs present, story shape, risks, applicable rules. A
Delivery Story needs `Expand` before planning; User/Technical Stories are already
implementable.

### 2. Plan

The Driver explores code and docs and writes design, trade-offs, scope boundaries,
risks and the verification approach into `plan.md` + `test-guide.md`. Under Ariad,
**the plan is the story package**.

*Checkpoint:* the Driver presents the plan in Navigator language — scope, non-goals,
accepted behavior, validation route. The Navigator approves or redirects.
**Implementation is blocked until approval.**

### 3. Implement

Change in focused slices. **TDD for behavior change**; a bug fix has a test that
reproduced the bug before the fix. Stable scope: if new scope appears, capture it as a
CR instead of silently absorbing it.

Mock the boundary, never the core. Here the boundary is the Kobana HTTP API; the
client's own behavior is the core, and it is verified against a **real local HTTP
server** — a mocked `fetch` cannot express the stalled-body failure mode that caused
the 2026-08-24 incident (principles §4).

### 4. Validate

The Driver updates `test-guide.md` with copy-pasteable commands and expected results,
runs the automated gates, then prepares a **manual validation route** for the
Navigator: commands to run, files to inspect, expected observations, and conscious
limitations.

For this repository the validation route usually includes a **consumer question**: does
this reach `kadu` immediately through `npx -y`, and does `kia-desktop`'s pin or
override need to change?

*Checkpoint:* the Navigator validates manually or explicitly waives it. Offering a
route is **not** acceptance.

### 5. Debt Review

Mandatory question at the end: **what design debt did this story accrue?**

Clean what fits inside the cycle. Record what does not — shaped debt goes to the
[technical debt ledger](../project/roadmap/technical-debt-ledger.md) with a revisit
criterion. **Debt deferred without a ledger entry is debt discarded, not deferred.**

The safe move for fast-generated entropy is usually subtraction and consolidation, not
rewriting.

### 6. Done

Done names three things: the **history action** (commit/push), the **roadmap update**
(story status, CV index) and the **next move**.

For this repository, Done has one extra obligation that the application repositories do
not have: **the release decision**. A merged fix that is not published has not reached
a single consumer. Either bump and publish, or record the deferral and who is left
unserved (principles §7).

The full bar is the
[Definition of Done](../project/engineering-principles.md#9-definition-of-done). Do not
summarize it from memory — open it and walk it.

---

## Pause discipline

Mandatory checkpoints for non-trivial work:

1. After the plan.
2. After the tests and the Navigator validation route.
3. After the review/debt assessment.
4. **Before commit and push.**

Between checkpoints the Driver works without asking permission for each file. At
checkpoints, actually stop. A "go ahead" releases up to the **next** checkpoint, not
for the whole cycle.

Beyond those, these are hard stops in this repository — stop and ask before:

- changing a **tool name, description or schema** (a model-facing behavior change,
  principles §6);
- touching the **access token, transports, redirect policy or timeout fencing**
  (MD-001, MD-002, principles §5);
- **publishing to npm** or bumping a version;
- adding a dependency;
- deleting or skipping a test;
- touching CI workflows;
- any scope expansion beyond what was asked.

---

## Verification gates before every integration

There is no CI today and no branch protection (MD-004), so **these are the only gate**:

```bash
# Typecheck every package (no root script covers mcp-help / mcp-site — TD-006)
for p in mcp-*/; do (cd "$p" && ../node_modules/.bin/tsc --noEmit) || echo "FAILED: $p"; done

# Build the workspace packages
npm run build

# Tests — once CV2 lands
npm test
```

Running them locally is the discipline, not a formality. When CV3 lands, `Checks` and
`Tests` will report the same thing on a pull request — reporting, not blocking, by
MD-004.

---

## Commits, push and release

Commits are small, in English, one concern each, with a message explaining the **why**.

After every push, verify the result with `gh` rather than assuming:

```bash
gh pr checks <number>
gh run list --limit 3
```

**Publishing is a separate, deliberate act.** It is not a side effect of merging, and
it is the step that actually reaches consumers. See
[CV1](../project/roadmap/cv1-release-and-consumers/index.md) for the pipeline being
built, and principles §7 for why `kadu` having no pin makes the pre-publish check the
real gate.

---

## Documentation maintenance

When behavior changes, the relevant doc changes in the same commit.

- A **decision** taken during a story is recorded as `MD<n>` in
  [`docs/project/decisions/`](../project/decisions/) **at the time it is taken**, not
  reconstructed later. The five seeded at adoption were reconstructions, and that cost
  real archaeology through commit messages — do not repeat it.
- A **tool surface change** is noted in the package's changelog, because it is a
  behavior change for every consumer.
- This repository is **public**: never link an internal Kia document, never include
  internal hostnames or customer data. Cite Kia decisions by bare code.

---

## What we learned before adopting this

Recorded so the reasons survive:

- **A fix that is not published has not happened.** The timeout fence was correct,
  verified, and merged — and left both consumers on unfenced code.
- **Eight copies turn one incident into eight patches.** Duplication is accepted for
  now (MD-005), but it is measured debt (TD-001), not comfort.
- **A mocked boundary can hide the failure you are fixing.** `fetch` resolves on
  headers; only a real stalling server proves the fence.
- **Verification that leaves nothing behind is spent effort.** Two throwaway scripts
  proved the 2026-08-24 fix and were discarded. CV2 exists so that stops happening.
