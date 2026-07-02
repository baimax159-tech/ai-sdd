# claude-forge — Claude Code 插件市场开发手册

## 仓库定位

本仓库是一个 **Claude Code Plugin Marketplace**，托管地址：
`https://github.com/baimax159-tech/claude-forge`

- **Marketplace 名称**：`claude-forge`
- **当前插件**：`forge-dev`（开发工具集）、`forge-sdd`（SDD 规格驱动开发）
- **开发模式**：由 Claude Code 自主完成插件和技能的开发、维护

## Claude 的工作职责

1. **技能开发者** — 在 `plugins/<plugin-name>/skills/` 下新增或修改技能
2. **配置维护者** — 同步更新 `plugin.json`、`marketplace.json`、`README.md`
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
| 修改 marketplace.json | [marketplace.md](.claude/rules/marketplace.md) |
| 测试 skill / 修改测试基建 | [test.md](.claude/rules/test.md) |
| 提交代码 / 打 Tag | [git-workflow.md](.claude/rules/git-workflow.md) |

---

## 仓库结构

```
claude-forge/
├── .claude-plugin/
│   └── marketplace.json                # Marketplace 入口清单（索引两个插件）
│
├── plugins/
│   ├── forge-dev/                      # 插件：开发工具集
│   │   ├── .claude-plugin/plugin.json  # 插件元数据（版本在此管理）
│   │   ├── skills/                     # 技能目录（init-plus）
│   │   ├── commands/                   # 斜杠命令（help.md）
│   │   ├── agents/ hooks/ mcp/         # 占位，待扩展
│   └── forge-sdd/                      # 插件：SDD 六阶段契约链（P0-P5）
│       ├── .claude-plugin/plugin.json
│       └── skills/                     # sdd-p0 … sdd-p5
│
├── scripts/
│   ├── validate.js                     # 本地验证脚本
│   ├── new-plugin.js                   # 创建新插件脚手架
│   └── test-sandbox.js                 # 测试沙箱编排与 check 引擎
│
└── .claude/rules/                      # Claude 开发规则（唯一权威来源）
```

---

## 开发流程速览

具体步骤、模板、字段约束一律以 `.claude/rules/` 对应文件为准，此处仅给主干顺序：

1. **新增/修改技能** → 读 [skill.md](.claude/rules/skill.md)，在 `plugins/<plugin-name>/skills/<skill-name>/` 下写 `SKILL.md` + `README.md`
2. **同步版本与清单** → Bump 对应 `plugin.json` 的 `version`（规则见 [plugin.md](.claude/rules/plugin.md)），更新根 `README.md` 与本文件的技能/插件清单
3. **测试** → 按 [test.md](.claude/rules/test.md) 对受影响 skill 做真实场景走查
4. **验证** → `claude plugin validate .`（整个 marketplace）
5. **提交** → 按 [git-workflow.md](.claude/rules/git-workflow.md) 规范提交

---

## 当前技能清单

| 技能 | 路径 | 斜杠命令 | 说明 |
|------|------|----------|------|
| init-plus | `plugins/forge-dev/skills/init-plus/` | `/forge-dev:init-plus` | 为项目生成 CLAUDE.md 和规则文件，支持 Java/Node.js/Go/Python/Shell |
| p0-skill-setup | `plugins/forge-sdd/skills/sdd-p0/` | `/forge-sdd:p0-skill-setup` | P0 开发能力就绪检查：四维度（Skill/MCP/Agent/Hook）覆盖检查与安装 |
| p1-requirements | `plugins/forge-sdd/skills/sdd-p1/` | `/forge-sdd:p1-requirements` | P1 需求获取引擎：多轮追问 + 覆盖自审 |
| p2-architecture | `plugins/forge-sdd/skills/sdd-p2/` | `/forge-sdd:p2-architecture` | P2 架构决策引擎：覆盖映射 + 接口定义 + ADR |
| p3-implementation | `plugins/forge-sdd/skills/sdd-p3/` | `/forge-sdd:p3-implementation` | P3 实现派发引擎：Task 协议 + subagent + 三闸 |
| p4-verification | `plugins/forge-sdd/skills/sdd-p4/` | `/forge-sdd:p4-verification` | P4 验证执行引擎：覆盖矩阵 + 验证命令 + 业务可用性验收 + 回滚预案 |
| p5-rules | `plugins/forge-sdd/skills/sdd-p5/` | `/forge-sdd:p5-rules` | P5 开发规则沉淀引擎：从实现中提炼框架级规则供后续复用 |

## 当前插件清单

| 插件 | 路径 | 类型 | 说明 |
|------|------|------|------|
| forge-dev | `plugins/forge-dev/` | 内部插件 | 开发工具集：init-plus |
| forge-sdd | `plugins/forge-sdd/` | 内部插件 | SDD 规格驱动开发：六阶段契约链（P0-P5） + gate 闸门 |

---

## 红线禁止事项

- **禁止** 将技能文件放在 `.claude-plugin/` 目录内
- **禁止** 在 `marketplace.json` 设置 `version`（本项目约定：版本只在 `plugin.json` 管理，详见 [marketplace.md](.claude/rules/marketplace.md)）
- **禁止** SKILL.md 超过 500 行
- **禁止** 在技能文件中硬编码 API 密钥、密码等敏感信息
- **禁止** 通过 `../` 引用插件目录外的文件
- **禁止** 跳过验证直接提交
- **禁止** 新增技能后不更新 `README.md` 和 `CLAUDE.md` 的清单
