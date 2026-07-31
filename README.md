# ai-sdd

> ai-sdd: a multi-agent plugin marketplace providing skills and extensions for development workflows

> ⚠️ 本仓库由上游 `agent-forge` 自动生成并同步的**只读镜像**，请勿直接修改；如需变更请在上游仓库改动后重新发布。

## 安装

### Claude Code

```bash
/plugin marketplace add https://github.com/baimax159-tech/ai-sdd
```

```bash
/plugin install ai-sdd@ai-sdd
```

### Codex

```bash
codex plugin marketplace add https://github.com/baimax159-tech/ai-sdd --sparse .agents/plugins --sparse plugins/ai-sdd
codex plugin add ai-sdd@ai-sdd
```

## 插件与技能

### ai-sdd

SDD spec-driven development plugin — skill-driven six-phase contract chain (P0-P5) + zero-dependency gate

| 命令 | 说明 |
|------|------|
| `/ai-sdd:sdd-p0` | P0 开发能力就绪检查 — 四维度（Skill/MCP/Agent/Hook）覆盖检查与安装 |
| `/ai-sdd:sdd-p1` | P1 需求获取引擎 — 多轮追问采集需求，生成 P1-req 或 P1p-diff 契约 |
| `/ai-sdd:sdd-p2` | P2 架构决策引擎 — 覆盖映射、数据模型、接口定义、ADR |
| `/ai-sdd:sdd-p3` | P3 实现派发引擎 — 可执行 Task 协议 + subagent 编码 + 三闸验证 |
| `/ai-sdd:sdd-p4` | P4 验证执行引擎 — 覆盖矩阵、验证命令、业务可用性验收、回滚预案 |
| `/ai-sdd:sdd-p5` | P5 开发规则沉淀引擎 — 从实现中提炼框架级规则供后续复用 |

## License

MIT

