---
name: help
description: Show all available skills and commands for the ai-sdd plugin
---

# ai-sdd — Spec-Driven Development Plugin

> Spec-Driven Development | v3.4.0 | Node.js 18+ | zero external dependencies

## Skills

| Command | Description |
|---------|-------------|
| `/ai-sdd:p0-skill-setup` | P0 readiness check — four-dimension (Skill/MCP/Agent/Hook) coverage check and installation |
| `/ai-sdd:p1-requirements` | P1 requirements engine — structured multi-round elicitation, generates P1-req or P1p-diff contract |
| `/ai-sdd:p2-architecture` | P2 architecture engine — coverage mapping, data model, interface definition, ADR |
| `/ai-sdd:p3-implementation` | P3 implementation engine — executable Task protocol + subagent coding + three-gate verification |
| `/ai-sdd:p4-verification` | P4 verification engine — coverage matrix, verification commands, business acceptance, rollback plan |
| `/ai-sdd:p5-rules` | P5 rules engine — extract framework-level rules from implementation for reuse |

## Workflow

```
P0 Setup → P1 Requirements → P2 Architecture → P3 Implementation → P4 Verification → P5 Rules
```

Each phase is guided by a skill; the gate validates contract quality.

## CLI Tools

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs scaffold <P1|P1p|P2|P3|P4|P5> <name>  # generate empty contract
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs gate SDD/contracts/<name>/<file>.md    # validate contract
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs verify-artifacts SDD/contracts/<name>/P3-impl-<name>.md  # artifact existence gate
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs scan-ids <file>.md                     # scan IDs
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs trace-extract <file>.md                # extract traceability
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs placeholder-scan <file>.md             # check placeholders
```

## More Info

- Plugin homepage: https://github.com/baimax159-tech/ai-sdd
