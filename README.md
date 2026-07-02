# claude-forge

A Claude Code plugin marketplace providing efficient skills and extensions for development workflows.

> ⚠️ Important: Make sure you trust a plugin before installing, updating, or using it.

## Plugins

### Internal Plugins

| Plugin | Description |
|--------|-------------|
| **forge-dev** | Development toolkit: project initialization docs generation |
| **forge-sdd** | SDD spec-driven development plugin — skill-driven six-phase contract chain (P0-P5) + zero-dependency gate |

## Installation

### Add Marketplace

```bash
/plugin marketplace add https://github.com/baimax159-tech/claude-forge
```

### Install Plugin

```bash
# forge-dev: 开发工具集
/plugin install forge-dev@claude-forge

# forge-sdd: SDD 规格驱动开发
/plugin install forge-sdd@claude-forge
```

## Structure

```
claude-forge/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── forge-dev/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── commands/
│       ├── skills/
│       └── README.md
├── scripts/
└── README.md
```

## Documentation

开发规则见 `CLAUDE.md` 和 `.claude/rules/` 目录。

测试流程见 `.claude/rules/test.md`。

## License

MIT

