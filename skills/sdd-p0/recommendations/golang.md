# Go 语言精选 Skill 推荐

精选源：[samber/cc-skills-golang](https://github.com/samber/cc-skills-golang)（2.3k+ star，MIT，活跃维护）

安装命令：`npx skills add samber/cc-skills-golang@<skill-name> -y`

---

## 必装项（SDD 流程核心依赖）

| skill | SDD 阶段 | 理由 |
|---|---|---|
| golang-testing | P3 实现 | 表驱动测试、fuzzing、覆盖率 — P3 测试先行的基础 |
| golang-error-handling | P3 实现 | 错误创建/包装/自定义 — 几乎所有 Go 代码都需要 |
| golang-design-patterns | P2/P3 | 函数选项、构建器、中间件链 — 设计模式选型 |
| golang-security | P3/P4 | 注入防护、加密、密钥管理 — 安全编码底线 |
| golang-concurrency | P3 实现 | goroutine/channel 并发模式 — Go 核心特性 |
| golang-code-style | P3 实现 | 格式化和编码规范 — subagent 编码规范 |

## 推荐项（按项目特征选装）

| skill | 适用条件 | 判断方式 |
|---|---|---|
| golang-database | 项目使用数据库 | go.mod 含 database/sql、GORM、sqlx、ent 等 |
| golang-grpc | 项目使用 gRPC | 存在 .proto 文件或 google.golang.org/grpc 依赖 |
| golang-graphql | 项目使用 GraphQL | 存在 gqlgen.yml 或 graphql 相关依赖 |
| golang-performance | 有性能 NFR | P1 契约含性能指标 |
| golang-benchmark | 需要性能测量 | 同上 |
| golang-observability | 有可观测需求 | go.mod 含 prometheus/opentelemetry 依赖 |
| golang-dependency-injection | 项目使用 DI | go.mod 含 wire/dig/fx 依赖 |
| golang-swagger | 提供 REST API | 存在 swagger/openapi 相关文件 |

## 可选项（用户主动选择）

| 类别 | skill 列表 |
|---|---|
| 项目初始化 | golang-project-layout、golang-cli、golang-continuous-integration、golang-dependency-management |
| 深度优化 | golang-data-structures、golang-safety、golang-lint、golang-modernize |
| 特定框架 | golang-spf13-cobra、golang-spf13-viper、golang-google-wire、golang-uber-dig、golang-uber-fx |
| samber 生态 | golang-samber-lo、golang-samber-do、golang-samber-oops 等（使用了对应库时推荐） |
| 文档/测试工具 | golang-documentation、golang-stretchr-testify、golang-troubleshooting |
