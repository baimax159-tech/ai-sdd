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
| p0-skill-setup | `/ai-sdd:p0-skill-setup` | P0 开发能力就绪检查 |
| p1-requirements | `/ai-sdd:p1-requirements` | P1 需求获取引擎 |
| p2-architecture | `/ai-sdd:p2-architecture` | P2 架构决策引擎 |
| p3-implementation | `/ai-sdd:p3-implementation` | P3 实现派发引擎 |
| p4-verification | `/ai-sdd:p4-verification` | P4 验证执行引擎 |
| p5-rules | `/ai-sdd:p5-rules` | P5 开发规则沉淀引擎 |

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

开发规则见 `CLAUDE.md` 和 `.claude/rules/` 目录。

测试流程见 `.claude/rules/test.md`。

## License

MIT
