---
name: sdd-p0
description: |
  P0 开发能力就绪检查：识别项目技术栈，从 Skill、MCP Server、Agent、Hook 四个维度检查扩展能力覆盖度，分通用/专项两层推荐，自动安装可自动化项、汇总手动项。
  当用户说"检查技能"、"准备开发环境"、"进入 P0"、"能力检查"或使用 /ai-sdd:sdd-p0 时触发。
allowed-tools: Read Write Edit Glob Bash AskUserQuestion
---

# P0 开发能力就绪检查

从四个维度检查 Claude Code 扩展能力覆盖度，分通用/专项两层推荐缺失项，能自动安装的直接安装并加载，不能的汇总成安装清单给用户。

## 工作流程

识别技术栈 → 通用推荐检查 → 专项推荐检查 → 汇总报告 → 用户确认 → 自动安装 + 手动清单 → 验证

---

## 步骤 1：识别项目技术栈

通过项目特征文件判断主语言和框架：

| 特征文件 | 语言/框架 |
|---|---|
| `go.mod` | Go |
| `pom.xml`、`build.gradle` | Java |
| `package.json` | Node.js/TypeScript |
| `requirements.txt`、`pyproject.toml`、`setup.py` | Python |
| `Cargo.toml` | Rust |

使用 `Glob` 扫描项目根目录下的特征文件。若存在多种语言特征，用 `AskUserQuestion` 让用户确认主语言。

---

## 步骤 2：通用推荐检查（所有项目适用）

不依赖语言，任何项目都应具备的基础能力。

### 通用 MCP Server

用 `Read` 读取 `${CLAUDE_PLUGIN_ROOT}/skills/sdd-p0/recommendations/mcp-common.md`，加载通用 MCP 推荐清单，逐项检查是否可用。

### 通用 Skill

检查方式：扫描当前 session 的 system-reminder 中 `available skills` 区域，按 skill 名称精确匹配判断是否已安装。

| 推荐项 | 用途 | 自动安装 |
|---|---|---|
| — | 通用 Skill 无强制项 | — |

> Skill 的安装通过 `npx skills add <repo>@<skill-name> -y` 执行，无需额外 skill 中转。

### 通用 Agent

| 推荐项 | 用途 | 检查方式 | 自动安装 |
|---|---|---|---|
| Explore | 代码探索 | 内置 | — 无需安装 |
| Plan | 架构规划 | 内置 | — 无需安装 |

---

## 步骤 3：专项推荐检查（基于项目语言和框架）

### 专项 Skill

#### 推荐数据加载

用 `Read` 读取 `${CLAUDE_PLUGIN_ROOT}/skills/sdd-p0/recommendations/<lang>.md`（如 `golang.md`），加载该语言的精选 skill 推荐清单。

- 文件存在 → 按清单中的三级分类（必装/推荐/可选）执行按需选择流程
- 文件不存在 → 退化为 `npx skills find <lang> <dimension>` 通用搜索（按下方通用维度）

#### 按需选择流程（有精选清单时）

1. 从 available skills 列表中检查**必装项**的覆盖情况
2. 扫描项目依赖文件（如 `go.mod`）判断**推荐项**的适用性（判断方式见清单）
3. 向用户展示分级推荐结果：
   - 必装项缺失 → 强烈建议安装
   - 推荐项适用 → 建议安装
   - 可选项 → 列出供用户自行勾选
4. 用 `AskUserQuestion` 让用户确认安装范围
5. 安装命令使用清单中的安装前缀 + skill 名称

#### 通用搜索（无精选清单时）

按以下通用维度通过 `Bash` 执行 `npx skills find <keyword>` 搜索：

| 维度 | 搜索关键词 | SDD 阶段 |
|---|---|---|
| testing | `<lang> testing` | P3 |
| error-handling | `<lang> error handling` | P3 |
| design-patterns | `<lang> design patterns` | P2/P3 |
| security | `<lang> security` | P3/P4 |
| performance | `<lang> performance` | P3/P4 |
| coding-standards | `<lang> coding standards` | P3 |

### 专项 Hook

根据项目语言推荐代码格式化 hook：

| 语言 | 格式化工具 | 自动安装 |
|---|---|---|
| Go | `gofmt` / `goimports` | ✅ 写入 hook 配置（工具随 Go SDK 自带） |
| Java | `google-java-format` | ❌ 需用户安装 jar |
| Python | `black` / `ruff` | ❌ 需用户 `pip install` |
| TypeScript | `prettier` | ❌ 需用户 `npm install` |
| Rust | `rustfmt` | ✅ 写入 hook 配置（工具随 Rust 工具链自带） |

### 专项 MCP / Agent

用 `Read` 读取 `${CLAUDE_PLUGIN_ROOT}/skills/sdd-p0/recommendations/mcp-<lang>.md`（如 `mcp-golang.md`），加载语言专属 MCP 推荐清单：

- 文件存在 → 按清单中的适用条件扫描项目依赖（用 `Glob`/`Read` 检查 `go.mod`、`Dockerfile` 等）判断推荐项的适用性
- 文件不存在 → 跳过专项 MCP 检查

无法自动安装的 MCP（需用户配置认证信息）归入手动清单，附配置模板。

---

## 步骤 4：汇总报告

将检查结果按"可自动安装"和"需手动安装"分组：

```
## P0 开发能力就绪报告

技术栈：Go（go.mod 检测）

### 已就绪 ✅
- codegraph MCP — 已连接
- Explore/Plan Agent — 内置
- golang-testing skill — 已安装
- ...

### 可自动安装（确认后立即执行）
1. context7 MCP — 写入 .mcp.json 配置
2. golang-security skill — `npx skills add` 安装
3. golang-benchmark skill — `npx skills add` 安装
4. 代码格式化 Hook — 写入 gofmt PostToolUse 配置

### 需手动安装（附命令）
1. google-java-format — `brew install google-java-format` 或下载 jar
2. postgres MCP — 需配置连接信息，参考：...
```

---

## 步骤 5：用户确认

用 `AskUserQuestion` 提供选项：
- 自动安装全部"可自动安装"项
- 选择部分自动安装（列出每项供勾选）
- 跳过全部

---

## 步骤 6：执行安装

### 自动安装流程

按依赖顺序执行，每项安装后立即验证：

**MCP Server**：
1. codegraph：先用 `Bash` 执行 `which codegraph` 检查 CLI 是否可用
   - 可用 → 执行 `codegraph init -i`，验证 `.codegraph/` 目录生成
   - 不可用 → 归入手动清单，告知用户先安装 codegraph CLI
2. context7：用 `Edit` 将配置追加到 `.mcp.json`
   - ⚠️ MCP 配置写入后需要**重启 session 才生效**，记录到最终提示

**Skill**（有精选清单时）：
1. 用 `Bash` 执行 `npx skills add <repo>@<skill-name> -y`（安装命令和 repo 来自推荐清单）
2. 安装后验证：检查命令退出码
3. 每个选中的 skill 逐一安装

**Skill**（无精选清单时）：
1. 用 `Bash` 执行 `npx skills find <keyword>` 搜索候选
2. 从搜索结果中选择匹配项，用 `npx skills add <repo>@<skill-name> -y` 安装

**Hook**：
1. 读取 `.claude/settings.json`（不存在则创建空 `{}`）
2. 用 `Edit` 在 `hooks.PostToolUse` 数组中追加格式化 hook 配置
3. 配置格式遵循官方 plugin-dev `hook-development` 的 PostToolUse 模式，结构：
   ```json
   {"hooks":{"PostToolUse":[{"matcher":"Edit|Write","hooks":[{"type":"command","command":"gofmt -w $FILEPATH","async":true}]}]}}
   ```
4. 配置模板按语言替换命令（如 Go 用 `gofmt -w`，Rust 用 `rustfmt`）

**Agent**：
1. 来自 plugin 的 → 提示安装对应 plugin
2. 自定义的 → 在 `.claude/agents/` 生成定义文件模板

### 手动安装清单

对无法自动安装的项，生成一份完整清单输出给用户：

```
## 手动安装清单

以下项目需要你手动安装，安装后重启 session 生效：

### 1. black（Python 格式化）
pip install black
# 安装后 P0 已配置的 Hook 会自动调用

### 2. postgres MCP
# 在 .mcp.json 中添加：
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic/pg-mcp"],
      "env": { "DATABASE_URL": "<你的连接字符串>" }
    }
  }
}
```

---

## 步骤 7：安装后验证

1. 逐项检查自动安装结果（文件是否生成、配置是否写入）
2. 展示最终覆盖度总结：
   - 自动安装成功 N 项
   - 手动清单 M 项（已输出给用户）
   - 跳过 K 项
3. 给出下一步建议：
   - 新安装了 Skill 或 MCP → "请 `/clear` 重启 session 加载新扩展，然后进入 P1"
   - 仅安装了 Hook 或无安装项 → "环境就绪，可直接进入 P1"

---

## 错误处理

| 场景 | 处理方式 |
|---|---|
| 无法识别项目语言 | 用 AskUserQuestion 让用户手动选择 |
| `npx skills find` 搜索无结果 | 告知该维度暂无可用 skill，归入手动清单 |
| npx 命令不可用 | 提示用户安装 Node.js，归入手动清单 |
| codegraph CLI 未安装 | 归入手动清单，附安装指引 |
| codegraph init 失败 | 展示错误，归入手动清单 |
| 配置文件写入冲突 | 展示当前配置，让用户确认合并方式 |
| 用户跳过全部 | 正常退出，告知后续阶段使用默认流程 |

---

## 与 P1 轻量检查的关系

P1 Phase A 包含一个轻量能力就绪检查（仅检查核心维度覆盖度）。两者关系：

- **已运行 P0** → P1 跳过轻量检查，直接进入需求采集
- **未运行 P0** → P1 轻量检查发现缺失时提示用户选择：运行 P0 完整检查 / 跳过继续
