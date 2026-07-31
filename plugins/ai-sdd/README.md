# ai-sdd — SDD 规格驱动开发插件

> Spec-Driven Development | Node.js 18+ | 零外部依赖

Skill 驱动的六阶段契约链开发插件。P0 能力就绪 → P1 需求 → P2 架构 → P3 实现 → P4 验证 → P5 规则沉淀，每阶段由 skill 引导工作流，gate 闸门保证契约质量。

## 安装

```bash
/plugin install ai-sdd@ai-sdd
```

## 使用方式

安装后由 skill 驱动 P0-P5 工作流；Claude Code 可使用下列命令入口，Codex 可直接用自然语言触发相同阶段：

| 阶段 | 触发方式 | 说明 |
|------|----------|------|
| P0 能力就绪 | `/ai-sdd:sdd-p0` 或说"检查技能"/"准备开发环境" | 四维度（Skill/MCP/Agent/Hook）覆盖检查与安装 |
| P1 需求 | `/ai-sdd:sdd-p1` 或说"做 XXX"/"迁移" | 多轮追问 → 生成 P1-req/P1p-diff 契约 |
| P2 架构 | `/ai-sdd:sdd-p2` 或说"开始架构设计" | 覆盖映射 + 接口定义 + ADR |
| P3 实现 | `/ai-sdd:sdd-p3` 或说"开始实现" | Task 协议 + subagent 编码 + 进度勾选 + 三闸 |
| P4 验证 | `/ai-sdd:sdd-p4` 或说"开始验证" | 覆盖矩阵 + 验证执行 + 回滚预案 |
| P5 规则沉淀 | `/ai-sdd:sdd-p5` 或说"沉淀规则" | 从实现中提炼框架级规则供后续复用 |

## 契约链

| 阶段 | 契约 | Gate 校验 |
|------|------|-----------|
| P1 需求 | AC / AC-FAIL / NFR | 结构完整 + ID 唯一 + 无占位符 |
| P2 架构 | IU / ADR | + 追溯命中 P1 ID + P1 100% 被覆盖 |
| P3 实现 | Task (file/test) | + 追溯命中 IU + IU 100% 被覆盖 + 产物存在 |
| P4 验证 | V | + 追溯命中 P1 + P1 100% 被覆盖 |

## CLI 工具

`PLUGIN_ROOT` 表示插件根目录：Claude Code 可设为 `$CLAUDE_PLUGIN_ROOT`；Codex 使用当前已安装插件的实际根路径。

```bash
node ${PLUGIN_ROOT}/scripts/sdd.mjs gate SDD/contracts/<file>.md          # 契约校验
node ${PLUGIN_ROOT}/scripts/sdd.mjs scaffold <P1|P1p|P2|P3|P4|P5> <name> # 生成空契约（已存在且非空则跳过，加 --force 强制覆盖）
node ${PLUGIN_ROOT}/scripts/sdd.mjs verify-artifacts SDD/contracts/P3-impl-<name>.md  # 产物存在闸
```

## 目录结构

```
ai-sdd/
├── .claude-plugin/plugin.json
├── skills/
│   ├── sdd-p0/          ← P0 能力就绪检查
│   ├── sdd-p1/          ← P1 需求获取
│   ├── sdd-p2/          ← P2 架构决策
│   ├── sdd-p3/          ← P3 实现派发
│   ├── sdd-p4/          ← P4 验证执行
│   └── sdd-p5/          ← P5 规则沉淀
├── scripts/
│   ├── sdd.mjs          ← CLI 入口（10 子命令）
│   └── lib/             ← 内部模块
├── commands/help.md
└── README.md
```

## License

MIT
