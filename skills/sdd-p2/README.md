# p2-architecture 技能

P2 架构决策引擎：消费 P1 需求契约，产出覆盖映射、数据模型、接口定义、实现单元清单和 ADR。

## 触发方式

- 斜杠命令：`/ai-sdd:p2-architecture`
- 关键词：说"开始架构设计"、"进入 P2"自动触发

## 功能

- 加载 P1 契约提取关键条目（AC/AC-FAIL/NFR/DF）
- 现有架构评估（可复用/需改造/需重建）
- 需求覆盖映射（每条 P1 条目 → 架构承接点）
- 数据模型 + 接口定义 + 模块层划分
- ADR 决策记录（备选方案 + trade-off + rationale）
- 实现单元清单（IU）生成
- 通用抽象提取（扩展点 + 跨项目 pattern 沉淀）
- gate 校验双向覆盖（P1 → P2 100% 覆盖）

## 产物

- `SDD/contracts/<name>/P2-arch-<name>.md`
