# 测试规则

> 指导 Claude 与维护者对 skill 做「真实场景手工测试」。判断质量由人负责，脚本只做确定性复核。

## 一、何时测试

新增或修改 skill 后，**提交前**必须对受影响的 skill 走一遍。测试范围由开发者决定——只测本次改动涉及的 skill，不强制全量。

## 二、依赖

`Node.js`（Claude Code 自带，无需额外安装）。

## 三、走查流程（每个选中的 skill 一轮）

```bash
# 1. 准备沙箱（init-plus 可指定语言：java-maven/nodejs/go/python/shell）
node scripts/test-sandbox.js prep <skill> [fixture]

# 2. 进入沙箱，真实调用 /<plugin>:<skill>（如 /forge-dev:init-plus），按真实场景回答交互提问（人）

# 3. 肉眼检查产物是否符合预期（判断环节，人负责）

# 4. 机器复核硬规则
node scripts/test-sandbox.js check <skill> <沙箱目录>

# 5. 确认后清理
node scripts/test-sandbox.js clean <沙箱目录>

# 6. 配置类改动额外跑
node scripts/validate.js
```

## 四、各 skill 预期产物

| skill | 预期产物（确定性断言见 `tests/expectations/<skill>.json`） |
|-------|----------------------------------------------------------|
| init-plus | `CLAUDE.md`（无残留 `{{}}`、构建命令匹配语言）、`.claude/rules/project/` 三件套，java-maven 另含 `module/` 三件套 |

## 五、为新 skill 加测试

1. 在 `tests/fixtures/` 准备或复用一个 fixture。
2. 在 `tests/expectations/<skill>.json` 写期望声明（断言词汇表：`files_exist` / `no_placeholder` / `valid_json` / `file_contains` / `json_contains`，可用 `per_fixture` 按 fixture 追加）。
3. 在 `scripts/test-sandbox.js` 的 `defaultFixture()` 函数加一行默认 fixture 映射。
4. 跑 `node tests/selftest.js` 与一次真实走查确认。

## 六、自检

改动测试基建本身后跑：`node tests/selftest.js`（应输出 `ALL PASS`）。
