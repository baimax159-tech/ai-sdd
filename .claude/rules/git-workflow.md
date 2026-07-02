# Git 工作流规则

## 何时提交

| 完成的操作 | 提交时机 |
|-----------|---------|
| 新增完整技能（SKILL.md + README.md） | 立即提交 |
| 修复技能 Bug | 立即提交 |
| 更新规则文件 | 立即提交 |
| 更新文档（README.md、CLAUDE.md） | 立即提交 |
| Bump plugin.json 版本号 | 与功能变更合并，不单独提交 |

**不提交**：临时调试文件、未完成的技能、验证未通过时。

## 提交前必须执行

```bash
node scripts/validate.js      # 验证 plugin.json 与 JSON 格式
claude plugin validate .      # Claude Code 官方验证
```

## Commit Message 格式

`<type>(<scope>): <subject>`

**type**：`feat` / `fix` / `refactor` / `docs` / `chore` / `style`

**scope**：`skill` / `plugin` / `command` / `hook` / `agent` / `rule` / `ci`

**subject**：中文，≤ 50 字，不以句号结尾

示例：
```
feat(skill): 新增 sdd-p6 技能 — 项目复盘沉淀
fix(skill): 修复 p3 gate 校验时 ID 格式误判
docs(rule): 更新 skill.md 检查清单
chore(plugin): bump version 3.4.0 → 3.5.0
```

## 标准提交流程

```bash
# 1. 验证
node scripts/validate.js

# 2. 暂存
git add .claude-plugin/plugin.json
git add skills/<skill-name>/
git add commands/help.md
git add README.md CLAUDE.md

# 3. 提交
git commit -m "feat(skill): 新增 xxx 技能"

# 4. 推送
git push origin main
```

## 多文件变更原则

**一次完整功能 = 一个 commit**：

```
✅ 一个 commit 包含：
  skills/<skill-name>/SKILL.md
  skills/<skill-name>/README.md
  .claude-plugin/plugin.json  (version bump)
  commands/help.md            (更新帮助)
  README.md / CLAUDE.md       (更新清单)

❌ 不要拆成多个 commit
```

## 版本 Tag

```bash
git tag v<version>          # 与 plugin.json version 一致
git push origin v<version>
```

何时打 Tag：新增技能（minor）、重要 Bug 修复（patch）、破坏性变更（major）后。

## 禁止事项

- 验证未通过时提交
- 提交含 API 密钥等敏感信息的文件
- 使用 `git commit -m "update"` 等无意义信息
- force push 到 main 分支
