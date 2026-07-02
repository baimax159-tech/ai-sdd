# Git 工作流规则

> 指导 Claude Code 在 ai-sdd 仓库中进行版本管理和提交操作。

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

**不提交的情况**：
- 临时调试文件
- 未完成的技能（SKILL.md 不完整）
- `node scripts/validate.js` 验证未通过时

---

## 二、提交前检查

**每次提交前必须执行**：

```bash
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
| `chore` | Bump 版本号、更新配置、脚本维护 |
| `style` | 格式调整（空格、换行），不影响功能 |

### scope 取值

| scope | 含义 |
|-------|------|
| `skill` | 技能相关变更 |
| `plugin` | plugin.json / 插件配置 |
| `hook` | hooks.json / Hook 脚本 |
| `agent` | Agent 文件 |
| `command` | commands/ 目录 |
| `rule` | `.claude/rules/` 规则文件 |
| `scripts` | scripts/ 目录 |

### subject 写法

- 中文，简洁说明做了什么
- 不超过 50 字
- 不以句号结尾

### 完整示例

```
feat(skill): 新增 sdd-p6-retrospect 技能 — 项目复盘与改进循环
fix(skill): 修复 sdd-p3 任务协议模板变量替换缺失问题
refactor(skill): 优化 sdd-p1 追问策略，减少轮数
docs(rule): 更新 skill.md 中 SDD 契约文件路径说明
chore(plugin): bump version 3.4.0 → 3.5.0
docs: 更新 README.md 技能列表
```

---

## 四、版本 Tag 规范

当发布新版本时：

```bash
# 确认 .claude-plugin/plugin.json 版本号已更新
git tag v<version>
git push origin v<version>
```

**Tag 命名**：与 `plugin.json` 的 `version` 一致，加 `v` 前缀。

**何时打 Tag**：
- 新增技能（minor 版本升级）后
- 重要 Bug 修复（patch 版本升级）后
- 破坏性变更（major 版本升级）后

---

## 五、标准提交流程

```bash
# 1. 验证（必须通过）
node scripts/validate.js

# 2. 查看变更文件
git status

# 3. 暂存所有相关文件
git add .claude-plugin/plugin.json
git add skills/<skill-name>/
git add commands/help.md
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

**一次完整功能 = 一个 commit**：

```
✅ 正确：一个 commit 包含
  - skills/sdd-p6/SKILL.md
  - skills/sdd-p6/README.md
  - .claude-plugin/plugin.json  (version bump)
  - commands/help.md  (更新帮助)
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
