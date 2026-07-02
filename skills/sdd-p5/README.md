# p5-rules

P5 Rules Consolidation Engine: after the full chain completes, extracts framework-level coding rules, architecture patterns, and best practices from the implementation and writes them into project rule files for future reuse.

## Trigger

- Slash command: `/ai-sdd:p5-rules`
- Keywords: "consolidate rules", "summarize dev standards", "enter P5"

## Features

- Loads full-chain P1→P4 contracts and code artifacts
- Extracts rules across five dimensions: architecture patterns, coding standards, framework usage, quality assurance, lessons learned
- User triage per rule (adopt / modify / discard)
- Incremental write to project rule files (`.claude/rules/` or `CLAUDE.md`)
- Tags rule sources to avoid duplication

## Outputs

- `.claude/rules/project/dev-rules.md` (or appended to existing rule file)
- `SDD/contracts/<name>/P5-rules-<name>.md` (rules consolidation contract)
