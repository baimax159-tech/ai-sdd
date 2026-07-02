# 插件仓库规则

> 指导 Claude Code 维护插件目录结构与 plugin.json 配置。

---

## 一、目录结构规范

### 标准结构（单插件根目录模式）

本仓库采用**单插件根目录**结构：插件即仓库根目录，`marketplace.json` 通过 `source: "."` 引用。

```
<repo-root>/
├── .claude-plugin/
│   ├── marketplace.json        # Marketplace 入口（source: "." 指向根目录）
│   └── plugin.json             # 插件元数据（唯一版本管理入口）
├── skills/                     # 技能目录（详见 skill.md）
│   └── <skill-name>/
│       ├── SKILL.md
│       └── README.md
├── commands/                   # 斜杠命令（.md 文件）
├── agents/                     # Agent 定义（.md 文件）
├── hooks/                      # Hook 配置（hooks.json）
└── mcp/                        # MCP Server 配置（mcp-config.json）
```

### 必须遵守
- `skills/`、`commands/`、`agents/`、`hooks/`、`mcp/` 在根目录下，与 `.claude-plugin/` 并列
- 插件必须有 `.claude-plugin/plugin.json`，与 `marketplace.json` 并列存放
- 多个技能通过命名空间区分，格式：`/<plugin-name>:<skill-name>`（如 `/ai-sdd:p1-requirements`）

### 禁止事项
- **禁止** 将 `skills/`、`commands/` 等组件目录放进 `.claude-plugin/` 目录内
- **禁止** 跳过验证直接提交

---

## 二、plugin.json 规范

文件位置：`plugins/<plugin-name>/.claude-plugin/plugin.json`

### 完整模板

```json
{
  "$schema": "https://json.schemastore.org/claude-code-plugin-manifest.json",
  "name": "<plugin-name>",
  "version": "x.y.z",
  "description": "<插件描述，关键词前置>",
  "author": {
    "name": "Max Bai",
    "email": "baimax159@gmail.com"
  },
  "homepage": "https://github.com/baimax159-tech/claude-forge",
  "repository": "https://github.com/baimax159-tech/claude-forge",
  "license": "MIT",
  "keywords": ["关键词1", "关键词2"],
  "category": "workflow",
  "tags": ["标签1", "标签2"],
  "commands": ["./commands/help.md"]
}
```

### 必须字段

| 字段 | 类型 | 格式约束 | 说明 |
|------|------|---------|------|
| `name` | string | kebab-case（小写字母/数字/连字符） | 插件唯一标识，也是技能命名空间前缀 |
| `version` | string | SemVer（`x.y.z`） | **版本唯一管理入口**，`marketplace.json` 不重复设置 |

### 推荐字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `$schema` | string | JSON Schema URL，编辑器自动补全用 |
| `description` | string | 简明描述，用于插件管理器显示 |
| `author.name` | string | 维护者名称 |
| `homepage` | string | 仓库主页 URL |
| `repository` | string | 源码仓库 URL |
| `license` | string | SPDX 标识，如 `MIT` |
| `keywords` | string[] | 小写短词，用于搜索发现 |
| `category` | string | 单个分类，如 `workflow`、`testing`、`security` |
| `tags` | string[] | 补充搜索标签 |

### 组件注册字段

按需添加，**仅注册已有实际内容的组件**：

| 字段 | 类型 | 示例 | 说明 |
|------|------|------|------|
| `commands` | string[] | `["./commands/help.md"]` | 激活的斜杠命令文件 |
| `agents` | string[] | `["./agents/my-agent.md"]` | 激活的 Agent 文件 |
| `hooks` | string | `"./hooks/hooks.json"` | Hook 配置文件路径 |
| `mcpServers` | string | `"./mcp/mcp-config.json"` | MCP Server 配置文件路径 |

> ⚠️ **占位文件不需要注册**：`agents/`、`hooks/`、`mcp/` 目录下的占位文件（仅含注释的 JSON）不要加入 plugin.json，等有实际内容时再注册。

---

## 三、版本管理规则

| 变更类型 | 版本位 | 示例 |
|----------|--------|------|
| 新增技能、新增功能 | **minor** +1 | `1.0.0 → 1.1.0` |
| Bug 修复、文档更新 | **patch** +1 | `1.0.0 → 1.0.1` |
| 删除技能、重命名、破坏性变更 | **major** +1 | `1.0.0 → 2.0.0` |

**版本唯一管理原则**：
- `version` **只在 `plugin.json` 中设置**
- `marketplace.json` 的插件条目**不设置** `version`
- 两者同时设置时 `plugin.json` 优先，但会造成混乱，禁止这样做

---

## 四、当前插件状态

仓库现有两个插件，完整清单见 `CLAUDE.md`：

| 插件 | 已注册组件 | 说明 |
|------|-----------|------|
| `forge-dev` | `skills/`、`commands/help.md` | 开发工具集：init-plus；`agents/`、`hooks/`、`mcp/` 为占位，暂未注册 |
| `forge-sdd` | `skills/`（sdd-p0 ~ sdd-p5） | SDD 规格驱动开发六阶段契约链 |

---

## 五、新增插件流程

如需在 marketplace 中新增插件（不只是在 forge-dev 下加技能）：

1. 运行脚手架：`bash scripts/new-plugin.sh <plugin-name>`
2. 填写 `.claude-plugin/plugin.json` 的描述字段
3. 在 `plugins/<plugin-name>/skills/` 下开发技能
4. 在 `.claude-plugin/marketplace.json` 的 `plugins` 数组中添加条目：
   ```json
   {
     "name": "<plugin-name>",
     "source": "<plugin-name>",
     "description": "插件描述",
     "license": "MIT",
     "keywords": ["关键词"],
     "category": "workflow"
   }
   ```
5. 验证：`claude plugin validate .`

---

## 六、plugin.json 修改检查清单

Claude 修改 `plugin.json` 后自检：

- [ ] `name` 与插件目录名一致（kebab-case）
- [ ] `version` 已按变更类型正确 Bump
- [ ] 已注册的组件文件实际存在（路径有效）
- [ ] 占位文件（仅含注释）未被注册
- [ ] `marketplace.json` 未同时设置 `version`
- [ ] JSON 格式合法（无尾随逗号、无注释）
