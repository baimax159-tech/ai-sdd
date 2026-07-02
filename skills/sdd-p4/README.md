# p4-verification

P4 Verification Engine: builds a verification coverage matrix from P1, executes verification scenarios, determines pass/fail, and produces the P4 verification contract.

## Trigger

- Slash command: `/ai-sdd:p4-verification`
- Keywords: "start verification", "enter P4"

## Features

- Loads P1/P2 verification sources (AC / AC-FAIL / NFR / DF)
- Generates verification coverage matrix (item → scenario → method → pass criteria)
- Subagent parallel verification execution (functional / error / performance / compatibility groups)
- Result aggregation + failure remediation + full regression
- **Business acceptance**: end-to-end real-scenario verification (HTTP requests for web services, full command sequences for CLI)
- Gate validates contract completeness
- Rollback plan generation

## Outputs

- `SDD/contracts/<name>/P4-verify-<name>.md`
