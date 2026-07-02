# Agent 开发规则

> 本项目中 Agent 的创建、注册与检查约束。

---

## 一、何时用 Agent（判断标准）

优先用 Skill。仅当以下任一条件成立才创建 Agent：

- 任务需要 **探索 → 规划 → 执行** 的多轮循环
- 需要**并行处理**多个独立子任务
- 单个任务预计**超出主会话上下文限制**

不满足上述任一条件 → 用 Skill。

---

## 二、文件位置

```
agents/
└── <agent-name>.md     ← kebab-case，与 name 字段一致
```

在 `.claude-plugin/plugin.json` 注册：

```json
{
  "agents": ["./agents/<agent-name>.md"]
}
```

占位文件（仅含注释）不注册。

---

## 三、必须字段

```yaml
---
name: agent-name          # kebab-case，与文件名一致
description: |
  [触发场景描述，≤ 1536 字符]
allowed-tools: Read Write Edit Glob Bash
context: fork             # Agent 必须设置
---
```

仅由主代理调用、不对用户暴露时加：`user-invocable: false`

---

## 四、正文必须包含

1. **目标** — 此 Agent 完成什么、输出什么
2. **输入** — 主代理传递的参数（`$ARGUMENTS` 或上下文说明）
3. **执行步骤** — 分阶段，每步明确用哪个工具
4. **输出格式** — 返回给主代理的摘要结构

---

## 五、开发检查清单

- [ ] frontmatter 含 `name`、`description`、`allowed-tools`、`context: fork`
- [ ] 文件名与 `name` 字段一致（kebab-case）
- [ ] 正文含「目标」「执行步骤」「输出格式」三节
- [ ] `allowed-tools` 只声明实际需要的工具
- [ ] 已在 `.claude-plugin/plugin.json` 的 `agents` 字段注册
- [ ] 仅供主代理调用时已设置 `user-invocable: false`
