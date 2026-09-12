# Engineering Principles — Kobana MCP Servers

**Status:** 🟡 Draft v0.1 — derived at Ariad adoption, 2026-09-12. Unreviewed.

Guidelines for code, tests, security, the tool surface, release, and process in this
repository.

## Provenance — derived, not copied

These principles are **derived** from the Kia engineering principles
(`kia-desktop/docs/project/engineering-principles.md`, v0.6 after six technical
reviews plus an editorial pass). That document is explicitly scoped to Kia — *"one
product, two repositories"* — and `kia-backend` references it rather than forking it.

That sharing rationale does not extend here. This is a different product, public,
published on npm, with two consumers of its own. So this document is a **reduction
and translation**, not a copy: the shared invariants are kept, Kia-specific substrate
is dropped, and two sections are rewritten for what this repository actually is. The
section-by-section accounting is in [Appendix A](#appendix-a--what-was-taken-from-kia-and-what-was-not).

It starts at **v0.1 and unreviewed on purpose.** Kia's reached v0.6 through six
technical reviews; inheriting that version number would claim a maturity this text
has not earned. Expect it to be wrong in places and correct it in the story that
finds the error.

## How to read this

- **This is a rulebook, not a tutorial.** It says what good work looks like here and
  why. For how to run things, see [`AGENTS.md`](../../AGENTS.md) and the
  [`README`](../../README.md).
- **Use the [Definition of Done](#9-definition-of-done) as a daily checklist.**
- **Notation:** `§N` a section here · `MD-001` a
  [decision](decisions/index.md) of this repository · `TD-001` an entry in the
  [debt ledger](roadmap/technical-debt-ledger.md) · `CV1.DS1` a roadmap item.
- Decisions owned by the Kia registries are cited **by bare code** (`D109`, `BD004`)
  and never linked: those documents are in internal repositories, this one is public.

## The essentials

1. **Build the right thing before building it well.** The simplest version is usually
   correct. (§1)
2. **AI generates bad code fast — you are the brake.** No dead code, no copy-paste,
   small clear units. (§1, §3)
3. **Tests come first — for features *and* bug fixes.** A flaky test is a bug to fix,
   never a retry. (§4)
4. **The access token is the asset.** These servers hold a credential that moves
   money. Fail closed. (§5)
5. **A tool description is behavior, not copy.** 117 of the 122 tools in another
   repository's eval catalog are authored here. (§6)
6. **Source-green is not release-green.** Merged is not delivered; two consumers can
   only see what is published. (§7)
7. **Where the server owns a computation, we are transport for it** — never a second
   implementation of it. (MD-003)
8. **When in doubt, run the [Definition of Done](#9-definition-of-done).**

---

## 1. Core principle: effectiveness before efficiency

**Build the right thing before optimizing how you build it.** Ask "is this the right
thing, is there a simpler version?" *before* writing code. A fast implementation of
the wrong thing is waste at speed.

**AI makes entropy cheap — quality gates matter more, not less.** This repository is
the clearest case of it in the workspace, and the evidence is on disk:

- It was **generated from a prompt.** The original instruction — *"Baseado na
  documentação da API desenvolva o código dos servidores MCP"* — is preserved in
  `docs-legacy/instructions.md`. That is its provenance, and it explains the shape.
- **Eight near-identical copies** of `KobanaApiClient` (TD-001). One incident on
  2026-08-24 required the same patch eight times.
- **Exports nothing may reach:** `getConfigSafe()` in every package, consumption
  unverified (TD-008).
- **Three hardcoded version strings** per package disagreeing with `package.json`
  (TD-004).

None of that is a moral failing; it is what fast generation produces without gates.
**When AI is driving, the human is the friction that protects the codebase.**

**Reading cost is the real cost.** Writing is nearly free now; reading still costs
human time, and these packages are read under pressure — usually while something is
hanging in production. Optimize each line for the next person who has to understand
it during an incident.

---

## 2. Architecture and boundaries

**One package per API domain.** `admin`, `charge`, `data`, `edi`, `financial`,
`help`, `mailbox`, `payment`, `site`, `transfer`. Each publishes independently with
its own version. A tool belongs to the package that owns its API domain; do not reach
across packages.

**The layer direction is the architecture.** Every domain flows
`tool → api → client`:

- **`tools/`** owns the MCP surface: name, description, zod schema, and the
  `{ success, data | error }` envelope. It validates and delegates.
- **`api/`** owns endpoint shape: paths, query construction, response types.
- **`client.ts`** owns HTTP: auth header, timeout, redirect policy, error typing.

Never put HTTP concerns in a tool handler, and never put tool-envelope concerns in
the client. A junior reader who learns one domain should be able to predict the
others — which is exactly why a tool that breaks the pattern draws attention.

**Interfaces are thin.** Tool handlers and transport entry points are entry points:
they parse, validate and delegate. They do not own behavior. If logic deserves a
test, it belongs in `api/` or `client.ts`, not in the wrapper around it.

**Two transports, one server definition.** stdio (the primary, how consumers spawn
these) and stateless Streamable HTTP. Tool definitions are transport-agnostic; if a
behavior differs per transport, that is a design smell to name, not to special-case
quietly.

**Statelessness is a security property, not a scaling choice.** Per MD-002, each HTTP
request builds a fresh server and transport, because the previous session-based design
authorized tool calls by a `Math.random()` session id that was readable
cross-origin. There is no database and nothing to persist. **A change that
reintroduces server-side session state reopens a security finding** and must be
treated as a security decision.

---

## 3. Code

**Clarity first.** A line that needs a comment to be understood is usually a naming
or structure problem. But hard-won *why* belongs in the code: the comments explaining
`redirect: 'error'` (MD-001) and why one `AbortSignal` must also fence
`response.json()` are the reason those lines survive refactors. Do not delete that
knowledge — and do not let it substitute for readable code.

**DRY — and actually adopt the abstraction you build.** If you build a shared helper,
wire it up and delete the copies in the same change.

*Live tension, named:* MD-005 accepts eight duplicated clients for now. That is a
deferral of the abstraction, **not** a claim that the duplication is fine — it is
TD-001, with a revisit condition. Do not cite MD-005 to justify *new* duplication.

**No dead code.** Unused code is not neutral; it is a permanent "is this used?" tax on
every reader and a review risk. Delete it, or mark it as a deliberate placeholder with
the reason.

**High cohesion, small units.** One module, one responsibility. Prefer many small
nameable functions to a few large ones.

**Low coupling, one direction.** A change in a tool must not cascade into the client.

**Meaningful names, one verb per concept.** The same idea named three ways across
packages forces readers to memorize synonyms.

**TypeScript types are design.** Strict mode is the floor. No `any` as a shortcut.
Casts stay confined to the SDK boundary with a reason, never sprinkled to silence the
compiler.

**English everywhere.** Identifiers, comments, commit messages, test names, and — in
this repository specifically — documentation prose too, because it is public.

**Never log secrets.** `KOBANA_ACCESS_TOKEN` and full request URLs that may carry
credentials never reach a log. Log method, host and path.

---

## 4. Tests

**Tests are part of the Definition of Done.** Behavior changes follow TDD by default:
the test comes first. Bug fixes too — the first artifact of a fix is a test that
reproduces the defect and fails.

**Honest starting point:** there are **no tests** in this repository today. CV2 exists
to change that. Until it lands, this section describes the target, and every story
should leave it less aspirational than it found it.

**Mock the boundary, never the core.** Our boundary is the Kobana HTTP API. Our core
is the client's own behavior — timeout fencing, error classification, redirect
refusal, envelope shape.

**Prefer a real local server over a mocked `fetch`.** This is not style. The
2026-08-24 failure mode was *headers arrive, body never completes* — `fetch` resolves
on headers, so the hang was in `response.json()`. **A mocked `fetch` cannot express
that, and would have reported the fence working when it was not.** A
`http.createServer` that writes headers and then stalls does express it. Verified
twice, at 2003ms and 2002ms against a 2s budget.

**Determinism is an invariant; flake is a bug, never a retry.** Run with zero
retries. A flaky spec is fixed or quarantined behind a tracking issue, never disguised.

**Test our logic, not the framework.** Do not assert that zod validates or that the
MCP SDK serializes. Assert what *our* tool and client do.

**Error paths carry the same weight as happy paths.** The dull branches are where a
money tool loses trust: timeout, 401, 404, malformed body, empty result, 204. The
timeout fence is itself a pure error-path feature — it has no happy path at all.

**Do not duplicate tests to mirror duplicated code.** Per MD-005, parametrize over
packages: one contract factory, each package importing its own client. Eight runtime
copies must not become eight test copies.

**Know which gate upholds each principle.** Be honest about what is enforced by a
machine and what rests on a human:

- *Machine-enforced today:* `tsc --noEmit` (run locally; there is no CI).
- *Machine-enforced once CV3 lands:* typecheck and tests in `Checks`/`Tests`,
  formatting, dead-export audit, dependency advisories.
- *Human-only, permanently:* cohesion, coupling, naming, absence of dead code,
  DRY-and-adopt, comment quality, and **tool description accuracy** (§6). These have
  no machine safety net — which is why fast AI generation erodes them first.

**Every story ends in a concrete verification moment.** A test guide is a sequence of
copy-pasteable commands with expected output, not a description. Someone should be
able to run it without reading the plan.

---

## 5. Security and the access token

These packages are a **credential-bearing bridge to a financial API**. Their security
posture is not incidental; it is most of their job. This repository already has two
real findings in its history — an SSRF chain (MD-001) and a pre-auth session hijack
(MD-002) — so this section is written from the adversary's side.

**The token is the asset.** Every request carries a bearer token scoped to a real
Kobana account. Anything that could cause that header to reach a host we did not
intend is critical, not theoretical:

- Redirects are refused outright (MD-001), because `fetch` re-sends headers to the
  redirect target.
- A configurable API base URL is an attack surface; validate it, and never let the
  token travel to an unvalidated host.

**Authorization is per request; identity is not authorization.** MD-002. A value that
identifies a conversation is never a value that authorizes an action.

**Fail closed.** Missing configuration refuses to boot — `KOBANA_ACCESS_TOKEN` absent
throws rather than starting a server that will fail later and more cryptically. A
timeout is the same discipline in the time dimension: **no answer is a failure, not a
wait**, and it raises a distinct error type rather than degrading into something that
looks like a server response.

**Minimize what ships.** Every exported tool is reachable capability. A tool that
exists "for completeness" but has no consumer is attack surface with no upside.
Subtraction is the highest-confidence fix.

**API responses are untrusted content.** Statement descriptions, payee names and memo
fields flow from this repository into a model's context. Treat them as **data, never
instruction**: we do not interpret them, and we do not reformat them in ways that
could promote injected text into apparent instruction. A poisoned statement line is a
realistic delivery vehicle for prompt injection, and these packages are the delivery
path.

**Make approval decidable — the obligation that points at us.** The
human-in-the-loop gate for irreversible actions lives in the **consumer**, but this
repository authors the tools it gates on: `payment` exposes 24 tools and `transfer`
16. So the obligation here is to make the consumer's gate decidable:

- A tool's description must state truthfully what it *does*, especially that it moves
  money. A description that undersells its effect defeats an approval gate that a
  human is reading in a hurry.
- **Do not encourage prefix heuristics.** Kia's principles warn against auto-approving
  anything matching `list_/get_/query_`. This is where those names are chosen: a
  mutating tool must never be named so that a prefix heuristic would auto-approve it.
- Destructive and money-moving tools are named and described so that
  `needs_approval` is the obvious default.

---

## 6. The tool surface is a model-facing contract

This repository never calls a model. It nonetheless **defines what a model sees**, and
that makes tool names, descriptions and schemas versioned, evaluated assets rather
than copy.

The evidence is concrete. `kia-desktop`'s eval field catalog
(`evals/cv8ds3ts2/fixtures/tool-catalog-122.json`) holds 122 tools with names,
descriptions and parameters *"as they ride"*. **117 of them originate here:**

| admin | charge | data | edi | financial | payment | transfer |
|---|---|---|---|---|---|---|
| 17 | 35 | 2 | 4 | 19 | 24 | 16 |

Those evals measure model behavior — catalog-size sweeps and family probes — against
that catalog. **An edit to a description in this repository can move a measured curve
in another repository**, with no signal at either end today (TD-009).

Principles that follow:

**A description edit is a behavior change.** It gets the same care as a code change:
a reason, a plan, and a note in the changelog. It is not a copy tweak.

**Tools are minimal and orthogonal.** Each tool should be something a model can select
unambiguously. Two tools whose descriptions overlap are a selection failure waiting to
happen, and they cost catalog budget for every consumer.

**The catalog has a size cost.** 117 tools from one repository is a large share of a
consumer's context. Adding a tool is not free: it competes for selection accuracy
against every other tool. Prefer expressive parameters over tool proliferation.

**Schemas are a wire contract.** The zod schema becomes the JSON Schema the model
reasons about *and* the validation the call must satisfy. Tightening a schema can
break callers whose prior calls were accepted; loosening one silently widens what
reaches the API.

**Result shape is part of the contract.** Tool output enters a context window.
Unbounded results are a cost and truncation risk for every consumer — which is part of
why MD-003 points a failed summary at a paginated listing rather than silently
returning everything.

**Error text is model-facing too.** The `hint` added in MD-003 exists to be *read by
a model* and acted on inside the same turn. Error messages are part of the surface
this section governs, not an afterthought.

---

## 7. Release confidence

The sections above defend the code. This one defends **what consumers actually run**.

**Source-green is not release-green.** This repository's defining failure was not a
bad merge — it was a good merge that reached nobody. The timeout fence was correct,
verified, and merged on 2026-09-12 with **no version bump**, leaving both consumers on
unfenced code while `main` looked fixed. *Merged is not delivered.*

**Know your consumers' failure modes; they are not the same.**

| Consumer | Consumption | Failure mode to design against |
|---|---|---|
| `kia-desktop` | exact pins, vendored into a signed bundle with `--ignore-scripts` | Cannot receive a fix without a publish. Under pressure it patched our `dist/` into its own repository (TD-007) — a downstream fork of our artifact |
| `kadu` | `npx -y kobana-mcp-*`, seven packages | Takes latest instantly, with **no pin**. A bad publish is live immediately and **there is nothing to roll back to** |

**Every release has a known rollback — and for one consumer, rollback means forward.**
`kadu` has no pin, so the only recovery from a bad publish is publishing a corrected
version. That makes the pre-publish check the real gate, not the rollback plan.

**One version authority.** `package.json` is it. Version strings duplicated into
`serverInfo.version` or a `User-Agent` are drift waiting to happen (TD-004) — they
must be read from the manifest and asserted by a test, because a consumer debugging a
version-specific bug starts from the handshake.

**A published version says what changed.** Each package documents its own versions;
the root CHANGELOG stays repo-level, as it already declares.

**Never leave a consumer patching our artifact.** An override in a downstream
repository is a signal about *our* process, not theirs. When one exists, retiring it
is part of the work.

---

## 8. Process

**Design before code.** For non-trivial work: explore, design, present for approval.
Under Ariad the plan *is* the story package (`plan.md` + `test-guide.md`), and
implementation does not start until the Plan checkpoint is approved.

**Work the Ariad lifecycle honestly.** Pull → Prepare → Expand → Plan → Implement →
Validate → Debt Review → Done. Checkpoints are real stops: validation needs evidence,
the debt decision is explicit, and Done names the roadmap update. Maintenance that
does not move the roadmap goes to the
[Refinement Workbench](refinement/index.md) as a CR.

**Small stories, one session, concrete verification.** If a story cannot be verified
end to end by the end of a session, it is too big.

**Refactoring is inside the cycle, not a separate track.** When a story ends, ask what
debt it accrued and clean what is safe now. Shaped debt goes in the
[ledger](roadmap/technical-debt-ledger.md). For fast-generated entropy the safe move
is usually **subtraction and consolidation**, not rewriting.

**Docs update in the same cycle.** When behavior changes, the relevant doc changes in
the same commit. A README documenting things that do not exist is worse than none.

**The real gate is local.** Per MD-004 there is no branch protection here, and CI —
once CV3 lands — reports rather than blocks. So the checks you run before integrating
are the only thing between a mistake and `main`. Keep `main` releasable at every
integration.

**Commits stay small and in English.** One concern per commit; a message explaining
the *why*. No `WIP`, no "fix stuff". Prefer many small commits with clear review
boundaries — the same speed that created the entropy becomes safe again once each
change is small, tested and verified.

**Public repository hygiene.** This repository is public and the Kia repositories are
not. Never link an internal document; cite by bare code. Never include internal
hostnames, account identifiers or customer data in docs, tests or fixtures.

---

## 9. Definition of Done

Walk this before calling anything done.

- [ ] **It is the right thing** — the simplest version that satisfies the outcome;
      scope and non-goals stated.
- [ ] **Tests first, and they fail before they pass** — behavior change or bug fix
      both. Error paths covered, not only the happy path. Parametrized over packages
      rather than duplicated (MD-005).
- [ ] **Typecheck green in every affected package** — `tsc --noEmit`; there is no CI
      catching this for you today.
- [ ] **No dead code added** — no speculative exports, no orphan helper.
- [ ] **Security considered** — if it touches the token, transports, config or
      untrusted API content: the threat is named, it fails closed, secrets stay out
      of logs, and no new capability ships unreachable-but-present.
- [ ] **Tool surface reviewed** — if a name, description, schema or error string
      changed: it is treated as a behavior change, stated in the changelog, and
      checked against §6 (orthogonality, catalog cost, approval decidability).
- [ ] **Version and release decided** — version bumped and published, **or** the
      deferral recorded with who is left unserved. "Merged" is not an answer (§7).
- [ ] **Consumers considered** — does `kia-desktop`'s pin or override need to change;
      does this reach `kadu` immediately through `npx -y`?
- [ ] **Docs updated in the same change** — including this document when a principle
      is contradicted or refined.
- [ ] **Debt named** — anything deferred is in the
      [ledger](roadmap/technical-debt-ledger.md), not in memory.
- [ ] **Ariad checkpoint honored** — Validate / Debt Review / Done passed with
      evidence, not skipped.

---

## Appendix A — what was taken from Kia, and what was not

| Kia § | Section | Verdict here |
|---|---|---|
| 1 | Effectiveness before efficiency; AI entropy | **Adopted** (§1), re-evidenced from this repository |
| 2 | Architecture B | **Dropped.** Replaced by §2 — the agent loop, the model and human approval all live in the consumer, not here |
| 3 | Code | **Adopted** (§3), with the MD-005 tension named |
| 4 | Tests | **Adopted, rewritten** (§4) — our boundary is HTTP, our real substrate is a local server, not Postgres |
| 5 | Security and money | **Adopted, refocused** (§5) — token custody and approval decidability replace money arithmetic, which we do not perform (MD-003) |
| 6 | Data and persistence | **Dropped.** No database, deliberately (MD-002) |
| 7 | The model in the loop | **Adopted, reframed** (§6) — we never call a model, but we author 117 of 122 tools in its evaluated catalog |
| 8 | Release confidence | **Adopted, rewritten** (§7) — npm and two consumer topologies instead of signed installers and auto-update |
| 9 | Operations and runtime | **Mostly dropped.** No deploy, no database, no secrets store. Config-fails-closed folded into §5 |
| 10 | Process | **Adopted** (§8) |
| 11 | Definition of Done | **Adopted, adapted** (§9) — migrations, i18n and model-eval items dropped; version-and-publish and tool-surface items added |
| 12 | Where the repos diverge | **Rewritten as MD-004** — this repository has no branch protection at all |

Kia sections with no counterpart here — money arithmetic, database integrity, the
agent loop, installers, deploy and observability — are absent because the
corresponding substrate is absent, not because they were judged unimportant.
