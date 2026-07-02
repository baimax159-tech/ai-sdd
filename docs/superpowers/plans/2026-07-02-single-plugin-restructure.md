# Single Plugin Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 claude-forge marketplace 从双插件（forge-dev + forge-sdd）重构为单插件（ai-sdd）根目录扁平结构，删除 forge-dev 及 init-plus 技能。

**Architecture:** marketplace 保留但简化为单条目，插件 `ai-sdd`（原 forge-sdd）的所有内容从 `plugins/forge-sdd/` 提升到仓库根目录；`forge-dev` 及其 `init-plus` 技能整体丢弃；`.claude-plugin/plugin.json` 与 `marketplace.json` 并列放在根目录 `.claude-plugin/` 下。

**Tech Stack:** PowerShell / Git（文件移动与删除）、JSON（配置更新）、Markdown（文档更新）

## Global Constraints

- 插件新名称：`ai-sdd`（原 `forge-sdd`）
- `marketplace.json` 不设置 `version`（版本只在 `plugin.json` 管理）
- `source` 字段使用 `"."` 指向根目录
- 版本从 `3.3.0` bump 到 `3.4.0`（结构性重构 = minor +1）
- 所有斜杠命令前缀从 `/forge-sdd:` 改为 `/ai-sdd:`
- git 使用 `git mv` 移动文件以保留历史，使用 `git rm` 删除文件

---

### Task 1: 创建 `.claude-plugin/plugin.json`（新的单一插件元数据）

**Files:**
- Create: `.claude-plugin/plugin.json`

**Interfaces:**
- Produces: 根目录级别的 plugin.json，供 marketplace.json 通过 `source: "."` 隐式引用

- [ ] **Step 1: 创建 `.claude-plugin/plugin.json`**

写入以下内容：

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
  "homepage": "https://github.com/baimax159-tech/claude-forge",
  "repository": "https://github.com/baimax159-tech/claude-forge",
  "license": "MIT",
  "keywords": ["sdd", "spec-driven-development", "contract", "skill", "ai-sdd"],
  "commands": ["./commands/help.md"]
}
```

- [ ] **Step 2: 确认文件已创建**

```powershell
Get-Content ".claude-plugin/plugin.json"
```

预期：输出上述 JSON 内容，`name` 为 `ai-sdd`，`version` 为 `3.4.0`。

---

### Task 2: 更新 `.claude-plugin/marketplace.json`

**Files:**
- Modify: `.claude-plugin/marketplace.json`

**Interfaces:**
- Consumes: Task 1 创建的 `plugin.json`（通过 `source: "."` 隐式引用）

- [ ] **Step 1: 将 marketplace.json 更新为单插件配置**

新内容：

```json
{
  "$schema": "https://json.schemastore.org/claude-code-marketplace.json",
  "name": "claude-forge",
  "owner": { "name": "Max Bai", "email": "baimax159@gmail.com" },
  "description": "claude-forge: a Claude Code plugin marketplace providing efficient skills and extensions for development workflows",
  "metadata": {},
  "plugins": [
    { "name": "ai-sdd", "source": "." }
  ]
}
```

- [ ] **Step 2: 确认文件正确**

```powershell
Get-Content ".claude-plugin/marketplace.json"
```

预期：`plugins` 数组只有一条，`name` 为 `ai-sdd`，`source` 为 `"."`。

---

### Task 3: 迁移 `plugins/forge-sdd/skills/` → 根目录 `skills/`

**Files:**
- Create: `skills/sdd-p0/` … `skills/sdd-p5/`（git mv 迁移）

**Interfaces:**
- Produces: 根目录 `skills/` 包含 6 个技能目录

- [ ] **Step 1: 用 git mv 移动 skills 目录**

```bash
git mv plugins/forge-sdd/skills skills
```

- [ ] **Step 2: 确认移动成功**

```powershell
Get-ChildItem skills
```

预期：输出 sdd-p0, sdd-p1, sdd-p2, sdd-p3, sdd-p4, sdd-p5 六个目录。

---

### Task 4: 迁移 `plugins/forge-sdd/commands/` → 根目录 `commands/`，并更新前缀

**Files:**
- Create: `commands/help.md`（git mv 迁移）
- Modify: `commands/help.md`（`/forge-sdd:` → `/ai-sdd:`）

- [ ] **Step 1: 用 git mv 移动 commands 目录**

```bash
git mv plugins/forge-sdd/commands commands
```

- [ ] **Step 2: 将 commands/help.md 中所有 `/forge-sdd:` 替换为 `/ai-sdd:`**

```powershell
(Get-Content "commands/help.md" -Raw) -replace '/forge-sdd:', '/ai-sdd:' | Set-Content "commands/help.md"
```

- [ ] **Step 3: 确认无残留 forge-sdd 引用**

```powershell
Select-String -Path "commands/help.md" -Pattern "forge-sdd"
```

预期：无输出。

---

### Task 5: 迁移 `plugins/forge-sdd/scripts/` 到根目录 `scripts/`

**Files:**
- Create: `scripts/sdd.mjs`（git mv）
- Create: `scripts/lib/`（git mv）

- [ ] **Step 1: 用 git mv 移动 sdd.mjs**

```bash
git mv plugins/forge-sdd/scripts/sdd.mjs scripts/sdd.mjs
```

- [ ] **Step 2: 用 git mv 移动 lib/ 目录**

```bash
git mv plugins/forge-sdd/scripts/lib scripts/lib
```

- [ ] **Step 3: 检查 sdd.mjs 内是否有旧路径引用**

```powershell
Select-String -Path "scripts/sdd.mjs" -Pattern "plugins/forge-sdd"
```

如有匹配，手动将对应路径更新为新的相对路径（去掉 `plugins/forge-sdd` 前缀）。

- [ ] **Step 4: 检查 scripts/lib/ 内是否有旧路径引用**

```powershell
Get-ChildItem scripts/lib -Filter "*.mjs" | Select-String -Pattern "plugins/forge-sdd"
```

如有匹配，手动更新为新路径。

---

### Task 6: 删除 `plugins/` 目录（forge-dev 及 forge-sdd 残余）

**Files:**
- Delete: `plugins/forge-sdd/.claude-plugin/plugin.json`
- Delete: `plugins/forge-sdd/README.md`
- Delete: `plugins/forge-dev/`（整个目录）

- [ ] **Step 1: 删除 forge-sdd 残余文件**

```bash
git rm plugins/forge-sdd/.claude-plugin/plugin.json
git rm plugins/forge-sdd/README.md
```

- [ ] **Step 2: 删除 forge-dev 整个目录**

```bash
git rm -r plugins/forge-dev/
```

- [ ] **Step 3: 清理空目录残留**

```powershell
if (Test-Path plugins/) { Remove-Item -Recurse -Force plugins/ }
```

- [ ] **Step 4: 确认 plugins/ 已消失**

```powershell
Test-Path plugins/
```

预期：`False`

---

### Task 7: 批量更新 skills 内各 SKILL.md 的斜杠命令前缀

**Files:**
- Modify: `skills/sdd-p0/SKILL.md` … `skills/sdd-p5/SKILL.md`

- [ ] **Step 1: 批量替换 `/forge-sdd:` → `/ai-sdd:` in all skill Markdown files**

```powershell
Get-ChildItem skills -Recurse -Filter "*.md" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  if ($content -match '/forge-sdd:') {
    $content -replace '/forge-sdd:', '/ai-sdd:' | Set-Content $_.FullName
  }
}
```

- [ ] **Step 2: 确认无残留 `/forge-sdd:` 引用**

```powershell
Get-ChildItem skills -Recurse -Filter "*.md" | Select-String -Pattern "forge-sdd"
```

预期：无输出。

---

### Task 8: 清理 init-plus 测试文件及无用脚本

**Files:**
- Delete: `tests/expectations/init-plus.json`
- Delete: `tests/fixtures/go/`, `tests/fixtures/java-maven/`, `tests/fixtures/nodejs/`
- Delete: `scripts/new-plugin.js`
- Modify: `scripts/test-sandbox.js`（删除 init-plus 相关映射行）

- [ ] **Step 1: 删除 init-plus expectations**

```bash
git rm tests/expectations/init-plus.json
```

- [ ] **Step 2: 查看 tests/fixtures/ 内容，确认只有 init-plus 相关 fixture**

```powershell
Get-ChildItem tests/fixtures -Recurse | Select-Object FullName
```

确认无 SDD 相关 fixture 后继续。

- [ ] **Step 3: 删除 tests/fixtures/ 下的 init-plus fixture 目录**

```bash
git rm -r tests/fixtures/go tests/fixtures/java-maven tests/fixtures/nodejs
```

如有其他目录，只删除与 init-plus 相关的。

- [ ] **Step 4: 删除 scripts/new-plugin.js**

```bash
git rm scripts/new-plugin.js
```

- [ ] **Step 5: 读取 scripts/test-sandbox.js，找到 init-plus 相关映射**

```powershell
Select-String -Path "scripts/test-sandbox.js" -Pattern "init-plus"
```

- [ ] **Step 6: 编辑 scripts/test-sandbox.js，删除 init-plus 相关行**

根据 Step 5 的输出，用 Edit 工具删除 `defaultFixture()` 中 `init-plus` 映射行以及任何其他 init-plus 引用。

---

### Task 9: 更新 `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 更新仓库定位章节**

将以下内容：
```
- **Marketplace 名称**：`claude-forge`
- **当前插件**：`forge-dev`（开发工具集）、`forge-sdd`（SDD 规格驱动开发）
```
改为：
```
- **Marketplace 名称**：`claude-forge`
- **当前插件**：`ai-sdd`（SDD 规格驱动开发，六阶段契约链 P0-P5）
```

- [ ] **Step 2: 重写仓库结构章节**

新结构：
```
ai-sdd/
├── .claude-plugin/
│   ├── marketplace.json        # Marketplace 入口（source 指向根目录）
│   └── plugin.json             # 插件元数据（ai-sdd，版本在此管理）
│
├── skills/                     # SDD 六阶段技能
│   ├── sdd-p0/ … sdd-p5/
│
├── commands/
│   └── help.md
│
├── scripts/
│   ├── sdd.mjs                 # SDD 主入口
│   ├── lib/                    # 各阶段 lib（parse-contract、gate、scaffold 等）
│   ├── validate.js             # 本地验证脚本
│   └── test-sandbox.js         # 测试沙箱编排
│
└── .claude/rules/              # Claude 开发规则（唯一权威来源）
```

- [ ] **Step 3: 更新技能清单表格**

删除 init-plus 行，p0-p5 路径从 `plugins/forge-sdd/skills/sdd-pX/` 改为 `skills/sdd-pX/`，斜杠命令从 `/forge-sdd:` 改为 `/ai-sdd:`：

| 技能 | 路径 | 斜杠命令 | 说明 |
|------|------|----------|------|
| p0-skill-setup | `skills/sdd-p0/` | `/ai-sdd:p0-skill-setup` | P0 开发能力就绪检查 |
| p1-requirements | `skills/sdd-p1/` | `/ai-sdd:p1-requirements` | P1 需求获取引擎 |
| p2-architecture | `skills/sdd-p2/` | `/ai-sdd:p2-architecture` | P2 架构决策引擎 |
| p3-implementation | `skills/sdd-p3/` | `/ai-sdd:p3-implementation` | P3 实现派发引擎 |
| p4-verification | `skills/sdd-p4/` | `/ai-sdd:p4-verification` | P4 验证执行引擎 |
| p5-rules | `skills/sdd-p5/` | `/ai-sdd:p5-rules` | P5 开发规则沉淀引擎 |

- [ ] **Step 4: 更新插件清单表格**

删除 forge-dev 行，只保留 ai-sdd：

| 插件 | 路径 | 类型 | 说明 |
|------|------|------|------|
| ai-sdd | 根目录 | 内部插件 | SDD 规格驱动开发：六阶段契约链（P0-P5）+ gate 闸门 |

- [ ] **Step 5: 更新开发流程章节**

将 `plugins/<plugin-name>/skills/<skill-name>/` 改为 `skills/<skill-name>/`。

---

### Task 10: 更新 `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 更新 Plugins 表格**

删除 forge-dev 行，forge-sdd 改为 ai-sdd：

```markdown
| **ai-sdd** | AI-SDD spec-driven development — skill-driven six-phase contract chain (P0-P5) |
```

- [ ] **Step 2: 更新 Installation 命令**

将安装命令改为：
```bash
/plugin install ai-sdd@claude-forge
```
删除 forge-dev 的安装命令。

- [ ] **Step 3: 更新 Structure 示意图**

```
claude-forge/
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
├── skills/
│   └── sdd-p0/ … sdd-p5/
├── commands/
├── scripts/
└── README.md
```

---

### Task 11: 更新 `.claude/rules/` 规则文件

**Files:**
- Modify: `.claude/rules/plugin.md`
- Modify: `.claude/rules/skill.md`
- Modify: `.claude/rules/marketplace.md`

- [ ] **Step 1: 更新 plugin.md — 目录结构示例**

将标准结构示例中的 `plugins/<plugin-name>/` 前缀改为根目录写法，说明单插件时 `plugin.json` 在 `.claude-plugin/` 下与 `marketplace.json` 并列。

- [ ] **Step 2: 更新 skill.md — 路径示例**

将 `plugins/<plugin-name>/skills/<skill-name>/` 改为 `skills/<skill-name>/`，更新检查清单中对应路径说明。

- [ ] **Step 3: 更新 marketplace.md — source 示例**

在「本地路径」部分补充说明：当插件与 marketplace 在同一根目录时，使用 `source: "."` 即可。

---

### Task 12: 最终验证与提交

**Files:**
- No new files

- [ ] **Step 1: 运行 validate.js 验证整体配置**

```powershell
node scripts/validate.js
```

预期：通过，无错误输出。

- [ ] **Step 2: 检查 git status，确认变更完整**

```bash
git status
```

确认：无意外的未追踪文件，无遗漏的删除/移动。

- [ ] **Step 3: 暂存所有变更**

```bash
git add -A
```

- [ ] **Step 4: 提交**

```bash
git commit -m "chore(plugin): 重构为单插件根目录结构，forge-sdd 重命名为 ai-sdd，删除 forge-dev"
```

- [ ] **Step 5: 推送（确认后执行）**

```bash
git push origin main
```