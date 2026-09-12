# CLAUDE.md

**The workflow authority for this repository is [`AGENTS.md`](AGENTS.md). Read it.**

This file exists only so that Claude Code finds the same instructions Pi and Codex
read. It is deliberately a pointer and not a copy: two files describing one workflow
drift, and the drifting one is always the one you are reading.

## Start here

1. [`AGENTS.md`](AGENTS.md) — commands, architecture, integration gates, hard stops
2. [Engineering principles](docs/project/engineering-principles.md) — including the
   [Definition of Done](docs/project/engineering-principles.md#9-definition-of-done)
3. [Development guide](docs/process/development-guide.md) — the Ariad lifecycle
4. [Roadmap](docs/project/roadmap/index.md) · [Decisions](docs/project/decisions/index.md) · [Debt ledger](docs/project/roadmap/technical-debt-ledger.md)

## Three things worth knowing before you touch anything

- **There are no tests and no CI.** A green build is not a verified change. The gates
  in [`AGENTS.md`](AGENTS.md#gates-before-every-integration) are the only ones that
  exist.
- **Two consumers depend on these packages, and one has no pin.** `kadu` runs seven of
  them through `npx -y`, so a publish is live immediately with nothing to roll back to.
  Merged is not delivered.
- **Tool names and descriptions are behavior.** 117 of the 122 tools in
  `kia-desktop`'s eval field catalog come from here, verbatim. Editing a description is
  not a copy tweak.
