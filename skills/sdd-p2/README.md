# p2-architecture

P2 Architecture Engine: consumes the P1 requirements contract and produces a coverage mapping, data model, interface definitions, implementation unit list, and ADRs.

## Trigger

- Slash command: `/ai-sdd:p2-architecture`
- Keywords: "start architecture design", "enter P2"

## Features

- Loads P1 contract and extracts key items (AC / AC-FAIL / NFR / DF)
- Existing architecture assessment (reusable / needs modification / needs rebuild)
- Requirements coverage mapping (each P1 item → architectural anchor)
- Data model + interface definitions + module layering
- ADR records (alternatives + trade-offs + rationale)
- Implementation unit (IU) list generation
- Common abstraction extraction (extension points + cross-project pattern consolidation)
- Gate validates bidirectional coverage (P1 → P2 100% coverage)

## Outputs

- `SDD/contracts/<name>/P2-arch-<name>.md`
