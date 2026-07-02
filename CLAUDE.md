# ai-sdd — Claude Code 插件开发手册

## 仓库定位

本仓库是一个 **Claude Code 插件**，托管地址：
`https://github.com/baizhijian-tech/ai-sdd`

- **插件名称**：`ai-sdd`
- **功能**：SDD 规格驱动开发，六阶段契约链（P0-P5）
- **开发模式**：由 Claude Code 自主完成技能的开发、维护

## Claude 的工作职责

1. **技能开发者** — 在 `skills/` 下新增或修改技能
2. **配置维护者** — 同步更新 `.claude-plugin/plugin.json`、`README.md`
3. **质量把关者** — 每次变更后执行验证，确保配置合法

---

## 开发前必读规则

**任何开发动作前，先按下表读取对应规则文件**（`.claude/rules/` 下）。规则文件是各主题的唯一权威来源，本文件只做导航与清单，不重复其内容。

| 任务 | 必读规则 |
|------|---------|
| 新增 / 修改技能 | [skill.md](.claude/rules/skill.md) ← **最高优先级** |
| 新增 / 修改斜杠命令 | [command.md](.claude/rules/command.md) |
| 新增 / 修改 Agent | [agent.md](.claude/rules/agent.md) |
| 新增 / 修改 Hook | [hook.md](.claude/rules/hook.md) |
| 修改 plugin.json / 插件结构 | [plugin.md](.claude/rules/plugin.md) |
| 测试 skill / 修改测试基建 | [test.md](.claude/rules/test.md) |
| 提交代码 / 打 Tag | [git-workflow.md](.claude/rules/git-workflow.md) |

---

## 仓库结构

```
ai-sdd/
├── .claude-plugin/
│   └── plugin.json             # 插件元数据（ai-sdd，版本在此管理）
│
├── skills/                     # SDD 六阶段技能
│   ├── sdd-p0/                 # P0 开发能力就绪检查
│   ├── sdd-p1/                 # P1 需求获取引擎
│   ├── sdd-p2/                 # P2 架构决策引擎
│   ├── sdd-p3/                 # P3 实现派发引擎
│   ├── sdd-p4/                 # P4 验证执行引擎
│   └── sdd-p5/                 # P5 开发规则沉淀引擎
│
├── commands/
│   └── help.md                 # 斜杠命令帮助
│
├── scripts/
│   ├── sdd.mjs                 # SDD 主入口（scaffold / gate / verify-artifacts 等）
│   ├── lib/                    # 各阶段 lib（parse-contract、gate、scaffold 等）
│   ├── validate.js             # 本地验证脚本
│   └── test-sandbox.js         # 测试沙箱编排与 check 引擎
│
└── .claude/rules/              # Claude 开发规则（唯一权威来源）
```

---

## 开发流程速览

具体步骤、模板、字段约束一律以 `.claude/rules/` 对应文件为准，此处仅给主干顺序：

1. **新增/修改技能** → 读 [skill.md](.claude/rules/skill.md)，在 `skills/<skill-name>/` 下写 `SKILL.md` + `README.md`
2. **同步版本与清单** → Bump `.claude-plugin/plugin.json` 的 `version`（规则见 [plugin.md](.claude/rules/plugin.md)），更新根 `README.md` 与本文件的技能清单
3. **测试** → 按 [test.md](.claude/rules/test.md) 对受影响 skill 做真实场景走查
4. **验证** → `node scripts/validate.js` 或 `claude plugin validate .`
5. **提交** → 按 [git-workflow.md](.claude/rules/git-workflow.md) 规范提交

---

## 当前技能清单

| 技能 | 路径 | 斜杠命令 | 说明 |
|------|------|----------|------|
| p0-skill-setup | `skills/sdd-p0/` | `/ai-sdd:p0-skill-setup` | P0 开发能力就绪检查：四维度（Skill/MCP/Agent/Hook）覆盖检查与安装 |
| p1-requirements | `skills/sdd-p1/` | `/ai-sdd:p1-requirements` | P1 需求获取引擎：多轮追问 + 覆盖自审 |
| p2-architecture | `skills/sdd-p2/` | `/ai-sdd:p2-architecture` | P2 架构决策引擎：覆盖映射 + 接口定义 + ADR |
| p3-implementation | `skills/sdd-p3/` | `/ai-sdd:p3-implementation` | P3 实现派发引擎：Task 协议 + subagent + 三闸 |
| p4-verification | `skills/sdd-p4/` | `/ai-sdd:p4-verification` | P4 验证执行引擎：覆盖矩阵 + 验证命令 + 业务可用性验收 + 回滚预案 |
| p5-rules | `skills/sdd-p5/` | `/ai-sdd:p5-rules` | P5 开发规则沉淀引擎：从实现中提炼框架级规则供后续复用 |

## 当前插件清单

| 插件 | 路径 | 类型 | 说明 |
|------|------|------|------|
| ai-sdd | 根目录 | 内部插件 | SDD 规格驱动开发：六阶段契约链（P0-P5）+ gate 闸门 |

---

## 红线禁止事项

- **禁止** 将技能文件放在 `.claude-plugin/` 目录内
- **禁止** SKILL.md 超过 500 行
- **禁止** 在技能文件中硬编码 API 密钥、密码等敏感信息
- **禁止** 跳过验证直接提交
- **禁止** 新增技能后不更新 `README.md` 和 `CLAUDE.md` 的清单
