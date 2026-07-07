---
name: sdd-p2
description: |
  P2 架构决策引擎：消费 P1 需求契约，产出覆盖映射、数据模型、接口定义、实现单元清单和 ADR。
  当用户说"开始架构设计"、"进入 P2"或使用 /ai-sdd:sdd-p2 时触发。
allowed-tools: Read Write Glob Bash AskUserQuestion
---

# P2 架构决策引擎

## 触发条件

- P1 契约已确认（gate 绿 + 用户确认）
- 用户确认开始架构设计
- 或直接运行 `node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs scaffold P2 <name>` 后进入本 skill

## Phase A: 加载上游

0. **前置硬闸**：运行 `node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs can-enter <name> P2`。
   非 0 退出（P1 gate 未绿或未经用户确认）则拒绝进入，提示用户先完成并确认 P1，不得继续。
1. 读取已确认的 P1-req 或 P1p-diff 契约
2. 提取所有关键条目：
   - P1-req：AC、AC-FAIL、NFR、Q（待澄清假设）、技术约束
   - P1p-diff：DF-XX 差异项、合并规则、行为一致性声明
3. 加载 `SDD/glossary.md` + 项目规则
4. 从当前 session 的 available skills 列表中识别架构设计相关 skill：
   - 遍历 system-reminder 中所有 available skills 的名称和 description
   - 结合 P1 契约已确定的技术栈（语言、框架），判断每个 skill 是否与当前项目的架构设计相关
   - **判断依据**：skill 的 description 涉及设计模式、API 设计、架构模式、数据结构、依赖管理、编码规范等架构层面的内容，且与当前项目技术栈匹配
   - 对筛选出的 skill，用 `Skill` 工具调用以加载其规范内容
   - skill 返回的设计规范作为 Phase C 架构设计的**约束输入**
5. 如有现有代码，用 CodeGraph 加载项目结构：
   - `codegraph_files` 获取整体文件树
   - `codegraph_context`（描述需求关键词）获取相关入口点和符号
   - 仅 CodeGraph 不可用时退化为 Glob + Read

**上下文聚焦**：契约文件已加载完毕。本阶段所有判断和产出以上方契约文件的明文内容为唯一信息基准，不依赖对话历史中的隐含假设或推断。遇到模糊或信息缺失，以契约文件为准；契约未覆盖的事项用 AskUserQuestion 向用户确认。

---

## Phase A2: 现有架构评估

**仅当项目已有代码或正在迁移（P1p）时执行。全新项目（无现有代码）跳过本阶段。**

**评估工具（优先 CodeGraph）**：
- 结构匹配：`codegraph_files` 查看模块划分 + `codegraph_context` 定位涉及模块
- 接口兼容：`codegraph_search`（kind=function/method）+ `codegraph_node` 查看完整签名
- 依赖健康：`codegraph_callers`/`codegraph_callees` 分析耦合度
- 扩展瓶颈：`codegraph_impact` 评估关键符号的影响半径

逐条对照 P1 关键条目，评估现有架构的承载能力：

| 评估维度 | 问题 |
|---|---|
| 结构匹配 | 现有模块划分能否直接承接新需求？哪些模块需拆分/合并/新建？ |
| 接口兼容 | 现有接口签名能否覆盖新需求？哪些需扩展/重写？ |
| 技术栈 | 现有技术栈（语言、框架、中间件）能否满足 NFR？哪些需替换？ |
| 依赖健康 | 现有依赖是否有版本过旧、废弃、安全漏洞问题？ |
| 扩展瓶颈 | 哪些架构决策会阻碍未来扩展（硬编码、紧耦合、单点）？ |

输出三类结论：
- **可复用** — 现有设计直接承接，无需改动
- **需改造** — 现有设计基础可用但需调整（说明改什么、为什么）
- **需重建** — 现有设计无法承载，必须重新设计（说明理由）

**展示评估结论 → 用户确认**

---

## Phase B: 需求覆盖映射

逐条为 P1 关键条目分配架构承接点：

| P1 条目类型 | 承接点类型 |
|---|---|
| AC（验收标准） | 接口方法 / 数据模型字段 / 验证命令 |
| AC-FAIL（反向场景） | 错误处理策略 / 错误码定义 |
| NFR（非功能需求） | 架构约束 / 技术选型决策 |
| Q（待澄清假设） | 决策记录（暂停或写明假设） |
| DF-XX（差异项） | 兼容适配器 / 数据转换 / 配置迁移 |

**规则：**
- 每条关键条目至少有一个承接点
- 未覆盖的必须说明原因（"不涉及本模块" / "已拆分到其他契约"）
- Q 影响数据模型/接口/权限/NFR 时，必须暂停追问用户

**展示映射表 → 用户确认**

---

## Phase C: 架构设计

> **约束**：Phase A 步骤 4 加载的 skill 规范在本阶段生效。接口命名、设计模式选型、依赖注入方式等必须遵守已加载 skill 的约束。若 skill 规范与 ADR 候选方案冲突，以 skill 规范为准（除非用户显式覆盖）。

### C-1: 数据模型

- 统一数据模型（字段名/类型/约束/说明）
- 追问确认："数据模型是这样，对吗？有遗漏字段吗？"

### C-2: 接口定义

- 方法签名 / 参数 / 返回值 / 错误码
- 每个接口绑定覆盖的 AC 编号
- 追问确认："接口设计是否合理？"

### C-3: 模块层划分

- **依据 Phase A 已确定的技术栈（语言 / 框架），按该语言/框架的社区标准目录约定进行分层**，不套用固定层名。例如：
  - Go（Clean Architecture）：`domain/core/infra/handler/config`
  - Java/Spring：`controller/service/repository/entity/config`
  - PHP/Laravel：`Http/Controllers/Models/Services/Repositories`
  - Python/Django：按 app 划分 `views/models/serializers/urls`
  - Node/NestJS：`modules/<name>/{controller,service,entity}`
- 框架有强约定时遵守框架约定；无强约定时选该语言主流分层
- 声明各目录所属层级 + 依赖方向约束

### C-4: 决策记录（ADR）

每个关键技术选择：
- 2-3 个备选方案 + 各自 trade-off
- 推荐方案 + rationale
- 追问用户确认："我推荐方案 A 因为 XXX，确认吗？"

**复杂项目可用 subagent 并行：**
- subagent-A：数据模型 + 约束推导
- subagent-B：接口签名 + 错误码体系
- subagent-C：独立 ADR 调研（如技术选型对比）

### C-5: 验证命令锚点

读取 P1 探测的命令：`node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs state-show <name>` 的 `commands` 字段（build/test/run）。
填入契约「验证命令锚点」表的对应行。探测为空的命令必须在此补全为可执行命令——
gate 会校验 `test` 行非空且非占位（`-`/`无`/`TBD` 等一律判红）。这些锚点是 P3 集成验证、P4 验证命令的唯一命令来源，下游不再现场猜。

---

## Phase D: 通用抽象提取

设计完成后，回看全部架构产物，识别可抽象的扩展点和可沉淀的通用 pattern。

### D-1: 项目级扩展点提取

从当前设计中识别未来高频变更点，提取为通用接口/基类/扩展机制：

| 识别信号 | 抽象方式 | 示例 |
|---|---|---|
| 同类实现会持续新增 | 定义接口 + 注册机制 | Filter 接口、Strategy 接口 |
| 多处重复相似逻辑 | 抽取基类或通用函数 | BaseHandler、通用 codec |
| 配置项可预见会变化 | 抽为可配置扩展点 | 策略执行顺序、缓存 TTL |

每个扩展点必须说明：
- 接口/协议定义
- 新增实现时需要做什么（零改动核心 or 最小改动）
- 对应的 IU 编号

### D-2: 跨项目通用 pattern 沉淀

识别当前设计中可复用到其他项目的架构模式：

| 评估维度 | 问题 |
|---|---|
| 通用性 | 该 pattern 是否独立于业务领域？ |
| 复用价值 | 后续项目大概率会遇到类似场景？ |
| 边界清晰 | 能否用 ≤3 个接口描述清楚？ |

满足条件的 pattern 记录为候选沉淀项（不在本阶段实现，仅记录）：
- pattern 名称 + 一句话描述
- 关键接口签名
- 适用场景

**展示扩展点 + 候选 pattern → 用户确认**

---

## Phase E: 实现单元清单

为 P3 生成权威输入：

每个 IU-XX 必须包含：
- 覆盖的 P1/P1p 条目（AC/DF 编号）
- P2 承接点（接口/决策/约束）
- 目标文件路径
- 测试文件路径
- 依赖单元
- 并行安全性（是否可与其他 IU 并行）
- 复用的通用抽象（引用 Phase D 产出的扩展点编号，无则填 -）
- 完成标准

追问确认："拆分为 N 个实现单元，看看合理吗？"

---

## Phase F: 架构承接 loop

最多 3 轮检查：

| 检查项 | 不通过时 |
|---|---|
| 每条 P1 关键条目有承接点？ | 补映射 |
| 每个 IU 有目标文件？ | 补路径 |
| 决策记录有 rationale？ | 补理由 |
| 模块层划分一致？ | 修正层名 |

3 轮后仍未收敛 → 拆分或风险接受。

---

## Phase G: 门控与确认

1. **出口自检 loop（≤3 轮）**: `node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs gate SDD/contracts/<name>/P2-arch-<name>.md`
   gate 双向校验：① 每个 IU 的 covers 命中真实 P1 ID；② **正向覆盖——P1 每个 AC/AC-FAIL/NFR/DF 必须被某 IU 覆盖，缺一即红**。红则补 IU/追溯后重跑，直到 P2 对 P1 零缺失全覆盖。
2. **人工确认** → 用户说"进入 P3"；确认后运行 `node ${CLAUDE_PLUGIN_ROOT}/scripts/sdd.mjs state-set <name> P2 confirmed true` 落盘确认状态（P3 的 can-enter 据此放行）。
3. **进入 P3**: 引导用户用 sdd-p3 skill；P3 契约由该 skill 用 `scaffold P3 <name>` 生成，不再用 dispatch。

---

## 硬约束

1. **不得跳过覆盖映射** — 每条 P1 关键条目必须有承接或说明
2. **不得空 rationale** — 每个 ADR 的 chosen 必须有理由
3. **接口一旦确认不可擅改** — P3 实现必须严格遵守
4. **不得自动推进** — gate 未绿不得请求用户确认
5. **Q 影响架构时必须暂停** — 不得带假设继续设计
6. **P2 必须 100% 覆盖 P1，gate coverage 红绝不可绕过**
7. **分步确认、分步落盘** — Phase C 每个子步骤（数据模型、接口、模块层划分、ADR、实现单元）必须逐步展示并用平台选项交互（Claude Code 用 AskUserQuestion）获得用户确认后，再写入契约文件。禁止一次性输出全部架构内容。
8. **架构内容只落契约文件** — 数据模型、接口签名、模块划分等架构产物必须写入 P2 契约 markdown，不得仅在对话中展示代码块而不落盘
