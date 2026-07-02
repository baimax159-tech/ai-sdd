# ai-sdd — Plugin Development Reference

## Rules Index

Read the corresponding rule file **before any development action** (under `.claude/rules/`).

| Task | Rule File |
|------|-----------|
| Add / modify skill | [skill.md](.claude/rules/skill.md) ← **highest priority** |
| Add / modify slash command | [command.md](.claude/rules/command.md) |
| Add / modify Agent | [agent.md](.claude/rules/agent.md) |
| Add / modify Hook | [hook.md](.claude/rules/hook.md) |
| Edit plugin.json / plugin structure | [plugin.md](.claude/rules/plugin.md) |
| Test skill / modify test infrastructure | [test.md](.claude/rules/test.md) |
| Commit code / tag release | [git-workflow.md](.claude/rules/git-workflow.md) |

---

## Skill Inventory

| Skill | Path | Command | Description |
|-------|------|---------|-------------|
| p0-skill-setup | `skills/sdd-p0/` | `/ai-sdd:p0-skill-setup` | P0 readiness check — four-dimension (Skill/MCP/Agent/Hook) coverage check and installation |
| p1-requirements | `skills/sdd-p1/` | `/ai-sdd:p1-requirements` | P1 requirements engine — structured multi-round elicitation + coverage self-review |
| p2-architecture | `skills/sdd-p2/` | `/ai-sdd:p2-architecture` | P2 architecture engine — coverage mapping + interface definition + ADR |
| p3-implementation | `skills/sdd-p3/` | `/ai-sdd:p3-implementation` | P3 implementation engine — Task protocol + subagent execution + three-gate verification |
| p4-verification | `skills/sdd-p4/` | `/ai-sdd:p4-verification` | P4 verification engine — coverage matrix + verification commands + business acceptance + rollback plan |
| p5-rules | `skills/sdd-p5/` | `/ai-sdd:p5-rules` | P5 rules consolidation engine — extract framework-level rules from implementation for reuse |

---

## Hard Rules

- **Never** place skill files inside `.claude-plugin/`
- **Never** let `SKILL.md` exceed 500 lines
- **Never** hardcode API keys or credentials in skill files
- **Never** commit without running validation
- **Never** add a skill without updating the `README.md` and `CLAUDE.md` inventory
