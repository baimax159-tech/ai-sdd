---
name: help
description: 显示 ai-sdd 插件的所有可用技能和命令
---

# ai-sdd — SDD 规格驱动开发插件

> Spec-Driven Development | v3.4.0 | Node.js 18+ | 零外部依赖

## 可用技能

| 命令 | 说明 |
|------|------|
| `/ai-sdd:p0-skill-setup` | P0 开发能力就绪检查 — 四维度（Skill/MCP/Agent/Hook）覆盖检查与安装 |
| `/ai-sdd:p1-requirements` | P1 需求获取引擎 — 多轮追问采集需求，生成 P1-req 或 P1p-diff 契约 |
| `/ai-sdd:p2-architecture` | P2 架构决策引擎 — 覆盖映射、数据模型、接口定义、ADR |
| `/ai-sdd:p3-implementation` | P3 实现派发引擎 — 可执行 Task 协议 + subagent 编码 + 三闸验证 |
| `/ai-sdd:p4-verification` | P4 验证执行引擎 — 覆盖矩阵、验证命令、业务可用性验收、回滚预案 |
| `/ai-sdd:p5-rules` | P5 开发规则沉淀引擎 — 从实现中提炼框架级规则供后续复用 |

## 工作流

```
P0 技能准备 → P1 需求 → P2 架构 → P3 实现 → P4 验证 → P5 规则沉淀
```

每阶段由 skill 引导工作流，gate 闸门保证契约质量。

## CLI 工具

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs scaffold <P1|P1p|P2|P3|P4|P5> <name>  # 生成空契约
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs gate SDD/contracts/<name>/<file>.md    # 契约校验
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs verify-artifacts SDD/contracts/<name>/P3-impl-<name>.md  # 产物存在闸
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs scan-ids <file>.md                     # 扫描 ID
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs trace-extract <file>.md                # 提取追溯
node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs placeholder-scan <file>.md             # 占位符检查
```

## 更多信息

- 插件主页：https://github.com/baimax159-tech/ai-sdd