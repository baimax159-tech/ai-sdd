# Java 语言精选 Skill 推荐

精选源：[jabrena/plinth（cursor-rules-java）](https://github.com/jabrena/plinth)（413★，MIT，116 skill，CI + 5 家安全扫描器校验，活跃维护）

安装命令：`npx skills add jabrena/cursor-rules-java --skill <skill-name> --agent <host-agent> -y`

> ⚠️ 安装语法与 Go 源不同：plinth 用 `--skill <name> --agent <host-agent>`，非 `@<name>`。`<host-agent>` 按当前宿主选择（Claude Code 为 `claude-code`；Codex 使用其支持的 agent 标识，未知时转为手动安装项）。
> ⚠️ plinth 另含 planning/architecture/agile/compliance 类 skill（`0XX`、`8XX`），因职责与 ai-sdd 的 P1/P2 阶段重叠，**本清单不收录**，避免与 SDD 流程冲突。

---

## 必装项（SDD 流程核心依赖）

| skill | SDD 阶段 | 理由 |
|---|---|---|
| 130-java-testing-strategies | P3 实现 | 测试分层策略 — P3 测试先行的基础 |
| 131-java-testing-unit-testing | P3 实现 | JUnit5/Mockito/AssertJ 单元测试 |
| 126-java-exception-handling | P3 实现 | 异常设计与处理 — 几乎所有 Java 代码都需要 |
| 121-java-object-oriented-design | P2/P3 | OO 设计原则 — 编码规范底座 |
| 122-java-type-design | P2/P3 | 类型与 API 设计 — 接口契约落地 |
| 123-java-design-patterns | P2/P3 | 设计模式选型 |
| 124-java-secure-coding | P3/P4 | 注入防护、加密、密钥管理 — 安全编码底线 |
| 110-java-maven-best-practices | P0/P3 | Maven 构建规范（Maven 项目适用） |

## 推荐项（按项目特征选装）

| skill | 适用条件 | 判断方式 |
|---|---|---|
| 132-java-testing-integration-testing | 有集成测试 | pom/gradle 含 Testcontainers、spring-boot-starter-test |
| 133-java-testing-acceptance-tests | 有验收/BDD 测试 | 含 cucumber、serenity 等依赖 |
| 125-java-concurrency | 有并发/异步需求 | 使用 java.util.concurrent、CompletableFuture、虚拟线程 |
| 128-java-generics | 库/框架型项目、大量泛型 API | 对外暴露泛型接口 |
| 704-technologies-sql | 使用关系型数据库 | 含 JDBC、JPA/Hibernate、MyBatis 依赖 |
| 701-technologies-openapi | 提供 REST API | 含 springdoc-openapi、swagger 依赖 |
| 706-technologies-containers-docker | 容器化 | 存在 Dockerfile 或 compose 文件 |
| 145-java-refactoring-high-performance | 有性能 NFR | P1 契约含性能指标 |
| 181-java-observability-logging | 有日志规范需求 | 含 slf4j、logback、log4j2 |
| 170-java-documentation | 对外 API/库需文档 | 发布给外部使用 |

## 可选项（用户主动选择）

| 类别 | skill 列表 |
|---|---|
| 现代 Java | 141-java-refactoring-with-modern-features、142-java-functional-programming、143-java-functional-exception-handling、144-java-data-oriented-programming |
| 可观测性 | 182-java-observability-metrics-micrometer、183-java-observability-tracing-opentelemetry |
| 性能与剖析 | 151-java-performance-jmeter、152-java-performance-gatling、161-java-profiling-detect、162-java-profiling-analyze、163-java-profiling-refactor、164-java-profiling-verify |
| Maven 深度 | 111-java-maven-dependencies、112-java-maven-plugins、113-java-maven-documentation、114-java-maven-search |
| Spring Boot | 300-create-project、301-core、302-rest、303-validation、304-security、305-modulith、311~316-数据层（jdbc/data-jdbc/flyway/kafka/mongodb/mongock）、321~323-测试（前缀 `frameworks-spring-boot-`/`frameworks-spring-`） |
| Quarkus | 400~404、411~416、421~423（结构同 Spring Boot，前缀 `frameworks-quarkus-`） |
| Micronaut | 500~504、511~516、521~523（结构同 Spring Boot，前缀 `frameworks-micronaut-`） |
| 技术专项 | 702-technologies-wiremock、703-technologies-fuzzing-testing、705-technologies-nosql-mongodb |

> 框架三选一：按项目实际使用的框架（Spring Boot / Quarkus / Micronaut）只装对应一族，勿全装。
