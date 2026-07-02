# 测试规则

> 指导 Claude 与维护者对 skill 做「真实场景手工走查」。判断质量由人负责，脚本只做配置合法性复核。

## 一、何时测试

新增或修改 skill 后，**提交前**必须对受影响的 skill 走一遍。只测本次改动涉及的 skill，不强制全量。

## 二、依赖

`Node.js`（Claude Code 自带，无需额外安装）。

## 三、SDD Skill 走查流程

SDD 技能（sdd-p0 ~ sdd-p5）是 AI 引导式工作流，产物为目标业务项目中 `SDD/contracts/<name>/` 下的契约文件。走查步骤：

```bash
# 1. 进入任意目标业务项目目录（不是 ai-sdd 仓库本身）
cd <target-project>

# 2. 在 Claude 中真实触发对应 skill（人工操作）
#    /ai-sdd:p0-skill-setup
#    /ai-sdd:p1-requirements
#    （依此类推）

# 3. 按真实场景回答交互提问（人工）

# 4. 肉眼检查产物（判断由人负责）
#    - 契约文件是否完整生成于 SDD/contracts/<name>/
#    - 无 {{}} 残留占位符
#    - ID 格式正确（如 P1-REQ-001）
#    - 阶段间追溯链接有效（P2 追溯 P1，P3 追溯 P2）

# 5. 回 ai-sdd 仓库验证插件配置是否合法
node scripts/validate.js
```

## 四、各 skill 预期产物

| skill | 斜杠命令 | 产物位置 | 关键检查点 |
|-------|---------|---------|----------|
| sdd-p0 | `/ai-sdd:p0-skill-setup` | 无文件（安装/检查报告） | 四维度（Skill/MCP/Agent/Hook）检查完整，缺失项有推荐安装方案 |
| sdd-p1 | `/ai-sdd:p1-requirements` | `SDD/contracts/<name>/P1-req-<name>.md` | 需求 ID 格式正确、覆盖自审通过、无 {{}} |
| sdd-p2 | `/ai-sdd:p2-architecture` | `SDD/contracts/<name>/P2-arch-<name>.md` | 追溯至 P1-REQ-*、接口定义完整、ADR 有决策理由 |
| sdd-p3 | `/ai-sdd:p3-implementation` | `SDD/contracts/<name>/P3-impl-<name>.md` | Task 协议可执行（含接口约束/测试策略）、三闸定义 |
| sdd-p4 | `/ai-sdd:p4-verification` | `SDD/contracts/<name>/P4-verify-<name>.md` | 覆盖矩阵完整、验证命令可实际运行、回滚预案 |
| sdd-p5 | `/ai-sdd:p5-rules` | `SDD/contracts/<name>/P5-rules-<name>.md` | 规则来自实现提炼（非凭空捏造）、格式规范 |

## 五、为新 skill 加机器复核

如需为 skill 新增确定性断言（适用于有固定格式产物的技能）：

1. 在 `tests/expectations/<skill-name>.json` 写期望声明。
   断言词汇表：`files_exist` / `no_placeholder` / `valid_json` / `file_contains` / `json_contains`，可用 `per_fixture` 按 fixture 追加。
2. 在 `scripts/test-sandbox.js` 的 `defaultFixture()` 函数加一行 fixture 映射。
3. 跑 `node tests/selftest.js` 确认测试框架本身正常。

## 六、自检

改动测试基建本身后跑：`node tests/selftest.js`（应输出 `ALL PASS`）。
