# 通用 MCP Server 推荐

所有项目适用，不依赖语言。

## 必装项

| MCP Server | 用途 | 检查方式 | 自动安装 | 安装命令 |
|---|---|---|---|---|
| codegraph | 代码结构分析（符号搜索、调用链、影响半径） | session 中 `codegraph_*` 工具是否可用 | ✅ | `codegraph init -i` |
| context7 | 框架/库最新文档查询 | session 中 `context7_*` 工具是否可用 | ✅ | 写入 `.mcp.json`：`{"mcpServers":{"context7":{"command":"npx","args":["-y","@anthropic/context7-mcp@latest"]}}}` |

## 推荐项

| MCP Server | 用途 | 适用条件 | 自动安装 |
|---|---|---|---|
| github | PR/Issue 管理、代码审查 | 使用 GitHub 托管 | ❌ 需用户认证（`gh auth login`） |
