# Git 工作流规则

> 指导 Claude Code 在 claude-forge 仓库中进行版本管理和提交操作。

---

## 一、何时提交

Claude Code 在完成以下操作后，**主动发起提交**：

| 完成的操作 | 是否立即提交 |
|-----------|------------|
| 新增一个完整技能（SKILL.md + README.md） | ✅ 立即提交 |
| 修复技能 Bug | ✅ 立即提交 |
| 更新规则文件（`.claude/rules/`） | ✅ 立即提交 |
| 仅修改文档（README.md、CLAUDE.md） | ✅ 立即提交 |
| Bump `plugin.json` 版本号 | ⚠️ 与功能变更合并提交，不单独提交 |
| 修改占位文件（hooks.json、mcp-config.json）| ✅ 立即提交 |

**不提交的情况**：
- 临时调试文件
- 未完成的技能（SKILL.md 不完整）
- 验证（`claude plugin validate`）未通过时

---

## 二、提交前检查

**每次提交前必须执行**：

```bash
# 验证整个 marketplace（含所有插件配置与 JSON 格式）
claude plugin validate .

# 一键全量验证（脚本会校验各 plugin.json 与 marketplace.json）
node scripts/validate.js
```

验证通过后再执行 `git add` 和 `git commit`。

---

## 三、Commit Message 规范

格式：`<type>(<scope>): <subject>`

### type 取值

| type | 使用场景 |
|------|---------|
| `feat` | 新增技能、新增命令、新增 Agent/Hook |
| `fix` | 修复技能逻辑错误、修复配置问题 |
| `refactor` | 重构技能流程（不改变功能） |
| `docs` | 仅更新文档（README、CLAUDE.md、规则文件） |
| `chore` | Bump 版本号、更新配置、脚手架维护 |
| `style` | 格式调整（空格、换行），不影响功能 |

### scope 取值

| scope | 含义 |
|-------|------|
| `skill` | 技能相关变更 |
| `plugin` | plugin.json / 插件配置 |
| `marketplace` | marketplace.json |
| `hook` | hooks.json / Hook 脚本 |
| `agent` | Agent 文件 |
| `command` | commands/ 目录 |
| `rule` | `.claude/rules/` 规则文件 |
| `ci` | GitHub Actions / scripts/ |

### subject 写法

- 中文，简洁说明做了什么
- 不超过 50 字
- 不以句号结尾

### 完整示例

```
feat(skill): 新增 code-review 技能 — 对 Java/Go 项目代码进行规范检查
fix(skill): 修复 init-plus 模板变量 FRAMEWORK 未替换的问题
refactor(skill): 优化 init-plus 语言探测逻辑，支持 Windows 路径
docs(rule): 补充 hook.md 中 PreToolUse 决策输出说明
chore(plugin): bump version 1.0.0 → 1.1.0
docs: 更新 README.md 技能列表
```

---

## 四、版本 Tag 规范

当发布新版本时，打 Tag 触发 CI 自动发布：

```bash
# 确认 plugin.json 版本号已更新
git tag v<version>
git push origin v<version>
```

**Tag 命名**：与 `plugin.json` 的 `version` 保持一致，加 `v` 前缀。
- 示例：`version: "1.2.0"` → Tag: `v1.2.0`

**何时打 Tag**：
- 新增技能（minor 版本升级）后
- 重要 Bug 修复（patch 版本升级）后
- 破坏性变更（major 版本升级）后

---

## 五、标准提交流程

Claude Code 完成功能开发后，按以下顺序操作：

```bash
# 1. 验证（必须通过）
claude plugin validate .

# 2. 查看变更文件
git status

# 3. 暂存所有相关文件
git add plugins/<plugin-name>/.claude-plugin/plugin.json
git add plugins/<plugin-name>/skills/<skill-name>/
git add README.md
git add CLAUDE.md
# 根据实际变更情况调整

# 4. 提交
git commit -m "feat(skill): 新增 xxx 技能 — xxx"

# 5. 推送
git push origin main
```

---

## 六、多文件变更的提交策略

**一次完整功能 = 一个 commit**，不要拆分：

```
✅ 正确：一个 commit 包含
  - plugins/forge-dev/skills/new-skill/SKILL.md
  - plugins/forge-dev/skills/new-skill/README.md
  - plugins/forge-dev/.claude-plugin/plugin.json  (version bump)
  - plugins/forge-dev/commands/help.md  (更新帮助)
  - README.md  (更新技能列表)
  - CLAUDE.md  (更新技能清单)

❌ 错误：拆成多个 commit
  commit 1: 添加 SKILL.md
  commit 2: 更新 README.md
  commit 3: bump version
```

**例外**：纯文档更新（无功能变更）可单独提交，用 `docs:` type。

---

## 七、禁止事项

- **禁止** 验证未通过时提交
- **禁止** 提交含 API 密钥、密码等敏感信息的文件
- **禁止** 提交 `.idea/`、`.DS_Store` 等 IDE/系统文件（已在 `.gitignore` 中排除）
- **禁止** 使用 `git commit -m "update"` 等无意义的提交信息
- **禁止** force push 到 `main` 分支
