# 插件配置规则

> 指导 Claude Code 维护 ai-sdd 插件的目录结构与 `.claude-plugin/plugin.json` 配置。

---

## 一、仓库结构（单插件根目录模式）

仓库根目录即插件目录，无 marketplace 层：

```
ai-sdd/
├── .claude-plugin/
│   └── plugin.json             # 插件元数据（唯一版本管理入口）
├── skills/                     # 技能目录（详见 skill.md）
│   └── <skill-name>/
│       ├── SKILL.md
│       └── README.md
├── commands/                   # 斜杠命令（.md 文件）
├── agents/                     # Agent 定义（有实际内容时在 plugin.json 注册）
├── hooks/                      # Hook 配置（有实际内容时在 plugin.json 注册）
├── scripts/                    # 工具脚本（sdd.mjs、validate.js 等）
└── .claude/rules/              # Claude 开发规则
```

### 必须遵守
- `skills/`、`commands/` 等组件目录在**根目录**下，不能放入 `.claude-plugin/`
- 技能命名空间格式：`/ai-sdd:<skill-name>`
- 版本只在 `.claude-plugin/plugin.json` 中管理，不得在其他地方重复设置

### 禁止事项
- **禁止** 将技能/命令等目录放进 `.claude-plugin/` 目录内
- **禁止** 跳过验证直接提交
- **禁止** 在技能文件中通过 `../` 引用根目录外的文件

---

## 二、plugin.json 规范

文件位置：`.claude-plugin/plugin.json`

### 当前配置（参考实际文件）

```json
{
  "$schema": "https://json.schemastore.org/claude-code-plugin-manifest.json",
  "name": "ai-sdd",
  "version": "3.4.0",
  "description": "AI-SDD spec-driven development plugin — skill-driven six-phase contract chain (P0-P5) + zero-dependency gate",
  "author": {
    "name": "Max Bai",
    "email": "baimax159@gmail.com"
  },
  "homepage": "https://github.com/baimax159-tech/ai-sdd",
  "repository": "https://github.com/baimax159-tech/ai-sdd",
  "license": "MIT",
  "keywords": ["sdd", "spec-driven-development", "contract", "skill", "ai-sdd"],
  "commands": ["./commands/help.md"]
}
```

### 组件注册字段（按需添加）

| 字段 | 类型 | 示例 | 说明 |
|------|------|------|------|
| `commands` | string[] | `["./commands/help.md"]` | 激活的斜杠命令文件 |
| `agents` | string[] | `["./agents/my-agent.md"]` | 激活的 Agent 文件 |
| `hooks` | string | `"./hooks/hooks.json"` | Hook 配置文件路径 |
| `mcpServers` | string | `"./mcp/mcp-config.json"` | MCP Server 配置文件路径 |

> ⚠️ 只注册有实际内容的组件，空占位文件不注册。

---

## 三、版本管理规则

| 变更类型 | 版本位 | 示例 |
|----------|--------|------|
| 新增技能、新增功能 | **minor** +1 | `3.4.0 → 3.5.0` |
| Bug 修复、文档更新 | **patch** +1 | `3.4.0 → 3.4.1` |
| 删除技能、重命名、破坏性变更 | **major** +1 | `3.4.0 → 4.0.0` |

`version` 只在 `.claude-plugin/plugin.json` 中设置。

---

## 四、当前插件状态

| 组件 | 注册状态 | 说明 |
|------|---------|------|
| `skills/sdd-p0 ~ sdd-p5` | ✅ 自动发现 | SDD 六阶段技能 |
| `commands/help.md` | ✅ 已注册 | 帮助命令 `/ai-sdd:help` |
| `agents/` | ⬜ 未注册 | 暂无实际 Agent |
| `hooks/` | ⬜ 未注册 | 暂无实际 Hook |

---

## 五、plugin.json 修改检查清单

- [ ] `version` 已按变更类型正确 Bump
- [ ] 已注册的组件文件实际存在（路径有效）
- [ ] 空占位文件未被注册
- [ ] JSON 格式合法（无尾随逗号、无注释）
- [ ] `node scripts/validate.js` 通过
