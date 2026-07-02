# p3-implementation

P3 Implementation Engine: reads P2 implementation units, generates executable Task protocols, dispatches subagents for coding, and runs three integration verification gates.

## Trigger

- Slash command: `/ai-sdd:p3-implementation`
- Keywords: "start implementation", "enter P3"

## Features

- Loads P2 contract (interface signatures / data model / ADR / implementation units)
- Generates complete Task protocol (interface constraints + implementation protocol + test strategy + artifact list + completion criteria)
- Dependency analysis + Stage orchestration (parallel / serial decisions)
- Subagent dispatch execution (TDD: tests before implementation)
- Three integration gates: artifact existence gate + artifact correctness gate + contract gate
- P2 consistency review (signature / data model / ADR landing check)

## Outputs

- `SDD/contracts/<name>/P3-impl-<name>.md`
- Actual code files and test files (produced by subagents)
