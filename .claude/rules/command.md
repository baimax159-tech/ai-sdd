# 斜杠命令开发规则

> 指导 Claude Code 编写 `plugins/<plugin-name>/commands/` 下的命令文件。

---

## 一、何时用斜杠命令

斜杠命令是注册到命令面板的快捷入口，用户输入 `/<plugin-name>:<command-name>` 触发。正文即 Claude 执行时的提示词。

**适用**：帮助信息（如 `/forge-dev:help`）、状态查询、复杂 Skill 的简短入口。
**vs Skill**：Skill 承载完整操作流程、可关键词自动触发；命令仅 `/` 触发，多用于展示信息或快捷导航。

---

## 二、文件位置与结构

```
plugins/<plugin-name>/commands/
└── <command-name>.md     ← 命令文件（kebab-case）
```

文件名即命令名：`help.md` → `/forge-dev:help`

激活方式：在 `plugin.json` 中注册：

```json
{
  "commands": ["./commands/help.md"]
}
```

也支持注册整个目录（加载所有 `.md` 文件）：

```json
{
  "commands": "./commands/"
}
```

---

## 三、命令文件格式

### Frontmatter（必须字段）

```yaml
---
name: command-name
description: 命令功能的简短描述（在命令面板中显示）
---
```

### 可选 Frontmatter 字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `argument-hint` | 命令面板中显示的参数提示 | `"<skill-name>"` |
| `allowed-tools` | 命令执行时可用的工具 | `Read Bash` |

### 正文

命令的正文内容就是 Claude 执行该命令时的**提示词**，支持：

- 静态内容（帮助文档、说明文字）
- 使用 `$ARGUMENTS` 接收用户传入的参数
- 使用 `${CLAUDE_PLUGIN_ROOT}` 引用插件内文件

---

## 四、命令类型模式

### 模式 1：帮助命令（最常见）

展示插件所有可用技能和命令。

```markdown
---
name: help
description: 显示 <plugin-name> 插件的所有可用技能和命令
---

# <plugin-name> 帮助

## 可用技能

| 命令 | 说明 |
|------|------|
| `/<plugin-name>:skill-a` | 技能 A 的说明 |
| `/<plugin-name>:skill-b` | 技能 B 的说明 |

## 更多信息

- 插件主页：https://github.com/baimax159-tech/ai-sdd
```

### 模式 2：带参数的命令

用户输入 `/forge-dev:run java` 时，`$ARGUMENTS` = `"java"`。

```markdown
---
name: run
description: 执行指定技能
argument-hint: <skill-name>
allowed-tools: Read
---

执行技能：$ARGUMENTS

请根据技能名称 "$ARGUMENTS" 查找对应的 SKILL.md 并执行。
```

### 模式 3：状态查询命令

```markdown
---
name: status
description: 显示当前插件版本和已安装技能列表
allowed-tools: Read
---

读取 `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` 获取版本信息。
列出 `${CLAUDE_PLUGIN_ROOT}/skills/` 下的所有技能目录。
格式化输出版本号和技能列表。
```

---

## 五、命令命名约定

| 规范 | 说明 | 示例 |
|------|------|------|
| kebab-case | 文件名和 `name` 字段一致 | `help.md` → `name: help` |
| 动词或功能名 | 简洁、准确 | `help`、`status`、`list` |
| 不超过 3 个词 | 保持简短 | `run-tests`（好）vs `run-all-tests-now`（差） |

---

## 六、commands/ 目录维护

每次新增技能后，必须同步更新 `commands/help.md`：

```markdown
| `/forge-dev:<new-skill>` | 新技能的说明 |
```

**更新检查**：
- [ ] `commands/help.md` 的技能表格已添加新技能行
- [ ] 新命令文件已在 `plugin.json` 的 `commands` 字段注册
- [ ] frontmatter 包含 `name` 和 `description`
- [ ] 如使用 `$ARGUMENTS`，已在 `argument-hint` 中说明参数格式
