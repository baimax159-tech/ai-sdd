# p1-requirements

P1 Requirements Engine: collects complete requirements through structured multi-round elicitation, auto-detects intent (new feature vs. migration), and generates a P1-req or P1p-diff contract.

## Trigger

- Slash command: `/ai-sdd:p1-requirements`
- Keywords: "build XXX", "add feature", "migrate", "refactor", "start SDD"

## Features

- Auto-detects intent (new feature vs. migration)
- 10-element structured elicitation (role, main flow, branches, exceptions, concurrency, compatibility, security, data model, NFR, tech constraints)
- Subagent parallel scenario expansion (boundary / security / concurrency / compatibility)
- Coverage self-review checklist enforcement
- Migration path code scan + diff confirmation
- Gate auto-validates contract quality

## Outputs

- `SDD/contracts/<name>/P1-req-<name>.md` (new feature contract)
- `SDD/contracts/<name>/P1p-diff-<name>.md` (migration diff contract)
