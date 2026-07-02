# ai-sdd

A Claude Code plugin for SDD (Spec-Driven Development) — six-phase contract chain (P0-P5).

> ⚠️ Important: Make sure you trust a plugin before installing, updating, or using it.

## Installation

```bash
/plugin install https://github.com/baimax159-tech/ai-sdd
```

## Skills

| Skill | Command | Description |
|-------|---------|-------------|
| p0-skill-setup | `/ai-sdd:p0-skill-setup` | P0 readiness check — four-dimension (Skill/MCP/Agent/Hook) coverage |
| p1-requirements | `/ai-sdd:p1-requirements` | P1 requirements engine — structured elicitation, P1-req / P1p-diff contract |
| p2-architecture | `/ai-sdd:p2-architecture` | P2 architecture engine — coverage mapping, interface definition, ADR |
| p3-implementation | `/ai-sdd:p3-implementation` | P3 implementation engine — Task protocol + subagent execution + three-gate |
| p4-verification | `/ai-sdd:p4-verification` | P4 verification engine — coverage matrix, business acceptance, rollback plan |
| p5-rules | `/ai-sdd:p5-rules` | P5 rules consolidation — extract framework-level rules for reuse |

## Workflow

```
P0 Setup → P1 Requirements → P2 Architecture → P3 Implementation → P4 Verification → P5 Rules
```

## Structure

```
ai-sdd/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── sdd-p0/ … sdd-p5/
├── commands/
│   └── help.md
├── scripts/
│   ├── sdd.mjs
│   └── lib/
└── README.md
```

## Documentation

See `CLAUDE.md` and `.claude/rules/` for development guidelines.

See `.claude/rules/test.md` for testing procedures.

## License

MIT
