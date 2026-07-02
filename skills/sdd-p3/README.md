# p3-implementation 技能

P3 实现派发引擎：读取 P2 实现单元，生成可执行 Task 协议，派发 subagent 编码，运行集成验证三闸。

## 触发方式

- 斜杠命令：`/ai-sdd:p3-implementation`
- 关键词：说"开始实现"、"进入 P3"自动触发

## 功能

- 加载 P2 契约（接口签名/数据模型/ADR/实现单元）
- 生成完整 Task 协议（接口约束 + 实现协议 + 测试策略 + 产物清单 + 完成标准）
- 依赖分析 + Stage 编排（并行/串行判断）
- subagent 派发执行（TDD 先测试后实现）
- 集成验证三闸：产物存在闸 + 产物正确闸 + 契约闸
- P2 一致性复核（签名/数据模型/ADR 落地检查）

## 产物

- `SDD/contracts/<name>/P3-impl-<name>.md`
- 实际代码文件和测试文件（由 subagent 产出）
