# Agent 开发规则

> 指导 Claude Code 编写 `plugins/<plugin-name>/agents/` 下的 Agent 定义文件。

---

## 一、Agent 是什么 & 何时用

Agent（子代理）在**独立上下文**中运行，处理完整多步骤任务后将摘要汇报给主代理——独立上下文窗口、可并行、适合耗时长/上下文大的独立任务。

**选 Agent 还是 Skill**：能用 Skill 完成的**优先用 Skill**（更简单可控）。仅当满足以下之一才用 Agent：
- 需要探索 → 规划 → 执行的多轮循环
- 需要并行处理多个独立子任务
- 任务可能超过主会话上下文限制
- 典型场景：大型代码库分析、多模块并行重构、长流程报告生成

---

## 三、文件位置与结构

```
plugins/<plugin-name>/agents/
└── <agent-name>.md     ← Agent 定义文件（kebab-case）
```

激活方式：在 `plugin.json` 中注册：

```json
{
  "agents": ["./agents/my-agent.md"]
}
```

> ⚠️ 同 Hook 规则：占位的 `agents/README.md` **不注册**到 `plugin.json`。

---

## 四、Agent 文件格式

### Frontmatter（必须字段）

```yaml
---
name: agent-name
description: |
  Agent 的专长和适用场景。当用户说"xxx"或任务涉及 xxx 时触发。
  提供：具体能力描述1、能力描述2。
allowed-tools: Read Write Edit Glob Bash
context: fork
---
```

### 必须字段

| 字段 | 说明 |
|------|------|
| `name` | kebab-case，与文件名一致 |
| `description` | Agent 专长描述 + 触发场景，≤ 1536 字符 |
| `allowed-tools` | 此 Agent 可用的工具列表 |
| `context: fork` | **Agent 必须设置**，在独立上下文中运行 |

### 推荐字段

| 字段 | 值 | 说明 |
|------|-----|------|
| `agent` | `Explore` / `Plan` / `General` | 指定子代理类型，`Explore` 适合分析类任务 |
| `effort` | `high` / `xhigh` | Agent 任务通常较重，建议设置高预算 |
| `user-invocable` | `false` | 若只由主代理编排调用，不暴露给用户 |

---

## 五、正文结构规范

```markdown
# <agent-name> Agent

<一句话描述 Agent 的专长>

## 目标

明确说明此 Agent 要完成什么，输出什么。

## 输入

说明主代理传递给此 Agent 的信息（通过 $ARGUMENTS 或上下文）。

## 执行步骤

### 阶段 1：探索
<使用 Glob/Read 收集信息>

### 阶段 2：分析
<处理收集到的信息>

### 阶段 3：执行
<Write/Edit 执行实际操作>

## 输出

说明此 Agent 完成后返回给主代理的摘要格式：
- 完成项列表
- 关键发现
- 需要主代理关注的问题

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| 文件不存在 | 记录并跳过，在摘要中说明 |
| 操作失败 | 记录错误原因，不中断其他任务 |
```

---

## 六、Agent 与 Skill 协作模式

Agent 可以被 Skill 编排调用，形成「Skill 调度 → Agent 执行」的模式：

```markdown
<!-- 在 SKILL.md 中 -->
## 步骤 3：并行分析各模块

为每个模块启动独立 Agent：
- 使用 `context: fork` 的子代理分析 `src/auth/`
- 使用 `context: fork` 的子代理分析 `src/api/`
- 使用 `context: fork` 的子代理分析 `src/db/`

等待所有 Agent 完成后，汇总结果。
```

---

## 七、开发检查清单

新增 Agent 后自检：

- [ ] frontmatter 包含 `name`、`description`、`allowed-tools`、`context: fork`
- [ ] `description` 描述了触发场景，供主代理判断何时调用
- [ ] 正文包含「目标」「执行步骤」「输出格式」三个章节
- [ ] `allowed-tools` 只声明此 Agent 实际需要的工具
- [ ] 已在 `plugin.json` 的 `agents` 字段注册
- [ ] 如果只由主代理编排，设置了 `user-invocable: false`
- [ ] 已评估是否真的需要 Agent（而非更简单的 Skill）
