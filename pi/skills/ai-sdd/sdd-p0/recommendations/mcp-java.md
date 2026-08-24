# Java 项目 MCP Server 推荐

Java 项目专属 MCP 推荐，根据 pom.xml / build.gradle 依赖坐标判断适用性。

## 推荐项（按项目特征选装）

| MCP Server | 用途 | 判断方式 | 自动安装 | 安装/配置 |
|---|---|---|---|---|
| postgres | PostgreSQL 数据库操作 | 依赖含 `org.postgresql:postgresql`，或 Spring Data + postgres driver | ❌ | 需用户提供连接字符串，配置模板见下方 |
| mysql | MySQL 数据库操作 | 依赖含 `com.mysql:mysql-connector-j` 或 `mysql:mysql-connector-java` | ❌ | 同上 |
| redis | Redis 缓存操作 | 依赖含 `spring-boot-starter-data-redis`、`redis.clients:jedis`、`io.lettuce:lettuce-core` | ❌ | 同上 |
| mongodb | MongoDB 操作 | 依赖含 `spring-boot-starter-data-mongodb` 或 `org.mongodb:mongodb-driver-sync` | ❌ | 同上 |
| docker | 容器管理 | 项目根目录存在 `Dockerfile`、`docker-compose.yml` 或 `compose.yaml` | ❌ | 需用户配置 Docker 环境 |

## 配置模板

### 数据库 MCP（以 postgres 为例）

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic/pg-mcp"],
      "env": {
        "DATABASE_URL": "<用户填写连接字符串>"
      }
    }
  }
}
```

> 所有数据库 MCP 需要用户提供连接信息，P0 生成配置模板后由用户填写。