# 技能开发规则

> **最高优先级**，所有技能开发必须严格遵守。

---

## 文件位置

skills/<skill-name>/SKILL.md + README.md  （根目录下的 skills/ 目录，kebab-case）

禁止放入 .claude-plugin/ 目录。禁止通过 `../` 引用技能目录外文件。

---

## SKILL.md Frontmatter 必须字段

```yaml
name: <skill-name>          ← kebab-case，与目录名一致
description: |              ← ≤ 1536 字符，首句功能，次句触发关键词
  核心功能描述。
  当用户说"XXX"或使用 /ai-sdd:<skill-name> 时触发。
allowed-tools: Read Write Edit Glob Bash AskUserQuestion
```

只声明实际用到的工具，不声明多余工具。

## 可选 Frontmatter 字段

| 字段 | 适用场景 |
|------|---------|
| `disable-model-invocation: true` | 有写文件等副作用，避免自动触发 |
| `context: fork` | 流程复杂（>5步）或上下文较大 |
| `effort: high` | 配合 context: fork，任务较重时 |
| `user-invocable: false` | 仅供内部 Skill 编排调用 |
| `paths: "**/*.java"` | 限定自动触发的文件范围 |

---

## SKILL.md 正文必须包含

```
## 工作流程
<输入> → <步骤概览> → <输出>（一行）

## 步骤 1：<名称>
明确用哪个工具、读哪个文件、做什么判断。

## 步骤 N：<名称>
...

## 错误处理
| 场景 | 处理方式 |
```

- 写操作步骤，不写背景知识
- AskUserQuestion 必须列出问题和选项
- 正文不超过 500 行

---

## 版本管理

| 变更 | 版本 |
|------|------|
| 新增技能 | minor +1（1.0.0 → 1.1.0） |
| Bug 修复 | patch +1（1.0.0 → 1.0.1） |
| 删除/重命名 | major +1（1.0.0 → 2.0.0） |

修改 `.claude-plugin/plugin.json` 的 `version`，不在其他地方设置。

---

## 新增技能检查清单

- [ ] skills/<name>/SKILL.md 和 README.md 均已创建
- [ ] frontmatter 含 name / description（含触发关键词）/ allowed-tools
- [ ] SKILL.md 不超过 500 行
- [ ] .claude-plugin/plugin.json 的 version 已按规则 Bump
- [ ] README.md 已说明触发方式和功能
- [ ] 根目录 README.md 技能列表已更新
- [ ] CLAUDE.md 当前技能清单已更新
- [ ] `claude plugin validate .` 通过
