# 测试规则

## 何时测试

新增或修改 skill 后，提交前必须对受影响的 skill 走一遍真实场景。

## 走查流程

```bash
# 1. 准备沙箱
node scripts/test-sandbox.js prep <skill> [fixture]

# 2. 在沙箱目录真实调用 /ai-sdd:<skill>，按真实场景回答交互提问（人工）

# 3. 肉眼检查产物（判断环节，人负责）

# 4. 机器复核
node scripts/test-sandbox.js check <skill> <沙箱目录>

# 5. 清理
node scripts/test-sandbox.js clean <沙箱目录>

# 6. 配置类改动额外跑
node scripts/validate.js
```

## 各 skill 预期产物

| skill | 斜杠命令 | 产物位置 | 关键检查点 |
|-------|---------|---------|-----------|
| sdd-p0 | `/ai-sdd:p0-skill-setup` | 无文件（安装/检查报告） | 四维度（Skill/MCP/Agent/Hook）检查完整，缺失项有推荐安装方案 |
| sdd-p1 | `/ai-sdd:p1-requirements` | `SDD/contracts/<name>/P1-req-<name>.md` | 需求 ID 格式正确、覆盖自审通过、无 {{}} |
| sdd-p2 | `/ai-sdd:p2-architecture` | `SDD/contracts/<name>/P2-arch-<name>.md` | 追溯至 P1-REQ-*、接口定义完整、ADR 有决策理由 |
| sdd-p3 | `/ai-sdd:p3-implementation` | `SDD/contracts/<name>/P3-impl-<name>.md` | Task 协议可执行（含接口约束/测试策略）、三闸定义 |
| sdd-p4 | `/ai-sdd:p4-verification` | `SDD/contracts/<name>/P4-verify-<name>.md` | 覆盖矩阵完整、验证命令可实际运行、回滚预案 |
| sdd-p5 | `/ai-sdd:p5-rules` | `SDD/contracts/<name>/P5-rules-<name>.md` | 规则来自实现提炼（非凭空捏造）、格式规范 |

## 为新 skill 加机器复核

1. 在 `tests/fixtures/` 准备 fixture（若需要）
2. 在 `tests/expectations/<skill>.json` 写期望声明
   - 断言类型：`files_exist` / `no_placeholder` / `valid_json` / `file_contains` / `json_contains`
   - 可用 `per_fixture` 按 fixture 追加差异断言
3. 在 `scripts/test-sandbox.js` 的 `defaultFixture()` 加默认 fixture 映射
4. 跑 `node tests/selftest.js`（应输出 ALL PASS）

## 修改测试基建后自检

```bash
node tests/selftest.js
```
