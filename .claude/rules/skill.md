# 技能开发规则

> 本规则是 Claude Code 开发技能时的**最高优先级约束**，所有技能开发必须严格遵守。

---

## 一、目录与文件规范

### 必须
- 在 `plugins/<plugin-name>/skills/` 下创建技能子目录，目录名为技能名（kebab-case）
- 每个技能目录必须包含 `SKILL.md`（技能定义）和 `README.md`（用户文档）
- `SKILL.md` 使用 YAML frontmatter（`---` 分隔），置于文件最顶部
- `SKILL.md` 正文不超过 **500 行**

### 禁止
- 禁止将技能文件放入 `.claude-plugin/` 目录
- 禁止通过 `../` 引用技能目录外的文件
- 禁止在 `SKILL.md` 中嵌入大段参考文档（应通过相对路径链接引用）

---

## 二、Frontmatter 规范

### 必须字段

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `name` | string | kebab-case，与目录名一致 | 技能唯一标识，省略则用目录名 |
| `description` | string | ≤ 1536 字符，关键词前置 | 用途描述 + 触发时机（含触发关键词） |
| `allowed-tools` | string | 空格分隔工具名 | 声明技能可调用的工具，按最小权限原则 |

**`description` 写法要求**：
1. 首句说明核心功能
2. 次句列出触发关键词（供 Claude 自动触发匹配）
3. 示例：`为项目生成 CLAUDE.md 和规则文件，支持多语言。当用户说"初始化项目文档"、"生成 CLAUDE.md" 或使用 /init-plus 时触发。`

### 推荐字段

| 字段 | 值 | 使用场景 |
|------|-----|----------|
| `user-invocable: false` | false | 仅供 Claude 内部调用，不暴露到斜杠命令列表 |
| `disable-model-invocation: true` | true | 有写文件等副作用，禁止自动触发，只能手动 `/` 调用 |
| `context: fork` | fork | 复杂流程需要独立子代理，避免污染主上下文 |
| `agent: Explore` | Explore/Plan | 配合 `context: fork` 指定子代理类型 |
| `effort: medium` | low/medium/high/xhigh/max | 按任务复杂度设置上下文预算 |
| `paths` | glob 字符串 | 限定自动触发的文件范围，如 `"**/*.java,pom.xml"` |

### allowed-tools 选择原则（最小权限）

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| `Read` | 读取文件 | 需要读取项目文件时 |
| `Write` | 创建/覆盖文件 | 需要生成新文件时 |
| `Edit` | 修改文件片段 | 需要修改已有文件时 |
| `Glob` | 文件路径匹配 | 需要扫描目录结构时 |
| `Bash` | 执行 Shell 命令 | 需要运行命令获取信息时，**慎用** |
| `AskUserQuestion` | 向用户提问 | 需要用户确认或输入时 |

> 原则：**只声明技能实际需要的工具**，不声明多余工具。

---

## 三、正文结构规范

### 必须包含的章节

```markdown
## 工作流程
<输入> → <核心步骤> → <输出>（一行概览）

## 步骤 1：<名称>
<具体操作：用什么工具、读什么文件、做什么判断>

## 步骤 N：<名称>
...

## 错误处理
| 场景 | 处理方式 |
|------|----------|
| 用户取消 | 显示"操作已取消"并退出 |
| 文件不存在 | 跳过并告知用户 |
| ... | ... |
```

### 写作要求

- **写操作步骤，不写背景知识** — Claude 需要的是"做什么"，不是"为什么"
- **明确每步用哪个工具** — 如"使用 `Read` 读取 `pom.xml`"，不要含糊说"检查项目"
- **AskUserQuestion 必须列出问题和选项** — 提问内容要在 SKILL.md 中明确写出
- **输出结果要有格式规范** — 说明生成的文件路径、内容结构
- **使用变量**：`$ARGUMENTS`（斜杠命令参数）、`${CLAUDE_SKILL_DIR}`（技能目录自引用）

---

## 四、技能类型判断

根据技能特征选择合适的配置：

| 技能特征 | 推荐配置 |
|----------|----------|
| 有写文件操作，避免误触发 | `disable-model-invocation: true` |
| 流程复杂（>5步）、上下文大 | `context: fork` + `effort: high` |
| 只在特定文件类型下触发 | `paths: "**/*.java,pom.xml"` |
| 仅辅助其他技能，不对用户暴露 | `user-invocable: false` |
| 简单查询/展示，无副作用 | 默认配置（无需额外字段） |

---

## 五、版本管理

- 新增技能 → `plugin.json` 的 `version` **minor** +1（如 `1.0.0 → 1.1.0`）
- 修复技能 Bug → **patch** +1（如 `1.0.0 → 1.0.1`）
- 删除/重命名技能（破坏性变更）→ **major** +1（如 `1.0.0 → 2.0.0`）
- **禁止** 在 `marketplace.json` 中设置 `version`（由 `plugin.json` 统一管理）

---

## 六、完整 SKILL.md 示例

```markdown
---
name: code-review
description: |
  对当前项目代码进行规范检查，生成审查报告。
  当用户说"代码审查"、"检查代码规范"或使用 /forge-dev:code-review 时触发。
allowed-tools: Read Glob Bash AskUserQuestion
disable-model-invocation: true
effort: medium
---

# code-review 技能

审查项目代码规范，输出 Markdown 格式报告。

## 工作流程

扫描代码文件 → 逐项检查规范 → 询问报告范围 → 生成报告

## 步骤 1：扫描项目文件

使用 `Glob` 匹配 `src/**/*.java`（或对应语言文件），获取待审查文件列表。

## 步骤 2：规范检查

使用 `Read` 逐一读取文件，检查以下维度：
- 命名规范（类名 PascalCase、方法名 camelCase）
- 注释完整性
- 异常处理

## 步骤 3：询问用户

使用 `AskUserQuestion` 询问：
- 是否生成报告文件？（是/否）
- 报告路径（默认 `./code-review-report.md`）

## 步骤 4：生成报告

使用 `Write` 创建报告，格式：
- 问题汇总表（文件 | 行号 | 问题类型 | 描述）
- 修复建议

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| 未找到源码文件 | 提示用户确认项目目录 |
| 用户取消 | 显示"审查已取消"并退出 |
| 文件读取失败 | 跳过该文件，在报告中标注 |
```

---

## 七、开发检查清单

Claude 完成技能开发后，自检以下项目：

- [ ] `SKILL.md` 包含 frontmatter（`name`、`description`、`allowed-tools`）
- [ ] `description` 字段包含触发关键词
- [ ] `allowed-tools` 只声明了实际使用的工具
- [ ] `SKILL.md` 不超过 500 行
- [ ] `README.md` 已创建，包含触发方式和功能说明
- [ ] `plugin.json` 的 `version` 已按规则 Bump
- [ ] 根目录 `README.md` 技能列表已更新
- [ ] `CLAUDE.md` 当前技能清单已更新
- [ ] 执行 `claude plugin validate .` 通过
