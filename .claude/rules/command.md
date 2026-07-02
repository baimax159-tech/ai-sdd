# 斜杠命令开发规则

## 文件位置

commands/<command-name>.md  （kebab-case，根目录下的 commands/ 目录）

注册到 .claude-plugin/plugin.json：
  "commands": ["./commands/<command-name>.md"]

文件名即命令名：help.md → /ai-sdd:help

## Frontmatter 必须字段

```yaml
---
name: <command-name>
description: 命令功能的简短描述（在命令面板中显示）
---
```

可选字段：
- `argument-hint`：参数提示，如 `"<skill-name>"`
- `allowed-tools`：命令可用工具，如 `Read Bash`

## 正文规范

正文即 Claude 执行命令时的提示词：
- 静态内容直接写
- 参数用 `$ARGUMENTS` 接收
- 引用插件内文件用 `${CLAUDE_PLUGIN_ROOT}/...`

## 新增命令后必须同步

更新 commands/help.md 的技能表格，加入新命令行。

## 检查清单

- [ ] 文件在根目录 commands/ 下（kebab-case）
- [ ] frontmatter 含 name 和 description
- [ ] 已在 .claude-plugin/plugin.json 的 commands 字段注册
- [ ] commands/help.md 技能表格已更新
- [ ] 如使用 $ARGUMENTS，已设置 argument-hint
