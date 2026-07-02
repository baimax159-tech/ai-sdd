# Hook 开发规则

> 指导 Claude Code 编写和维护 `plugins/<plugin-name>/hooks/hooks.json`。

---

## 一、Hook 是什么

Hook 是**确定性自动化**机制：在生命周期特定节点**保证执行**指定的 shell 命令 / HTTP 请求 / MCP 工具调用（不依赖模型判断，可阻断危险操作）。与 Skill 的关键差异：Skill 由模型判断触发、不保证执行；Hook 由事件自动触发、保证执行。

**何时使用**：每次文件修改后强制格式化、Bash 执行前校验安全、记录审计日志 / 通知、阻止危险操作。

---

## 二、Hook 配置文件位置

```
plugins/<plugin-name>/hooks/hooks.json   ← 插件级 Hook
```

激活方式：在 `plugin.json` 中注册：

```json
{
  "hooks": "./hooks/hooks.json"
}
```

> ⚠️ 占位文件（仅含 `$comment`）**不要注册**到 `plugin.json`，等有实际 Hook 内容时再注册。

---

## 三、配置结构

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<匹配规则>",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/my-script.sh",
            "timeout": 30,
            "async": false
          }
        ]
      }
    ]
  }
}
```

三层结构：**事件名** → **matcher 分组** → **handler 数组**

---

## 四、Hook 事件速查

### 常用事件

| 事件 | 触发时机 | 能否阻断 | 常见用途 |
|------|----------|----------|----------|
| `PreToolUse` | 工具调用前 | ✅ 能 | 校验命令安全性、拦截危险操作 |
| `PostToolUse` | 工具调用成功后 | ❌ 否 | 格式化文件、记录日志 |
| `PostToolUseFailure` | 工具调用失败后 | ❌ 否 | 错误通知、回滚 |
| `SessionStart` | 会话开始/恢复时 | ❌ 否 | 注入上下文、环境初始化 |
| `UserPromptSubmit` | 用户提交 prompt 时 | ✅ 能 | 内容过滤、前置检查 |
| `Stop` | Claude 完成回复时 | ✅ 能（强制继续） | 完成验证、后置检查 |
| `SubagentStop` | 子代理结束时 | ✅ 能 | 子代理结果验证 |
| `PermissionRequest` | 权限对话框出现时 | ✅ 能（自动决策） | 自动授权 / 拒绝 |
| `Notification` | Claude 发送通知时 | ❌ 否 | 转发通知到外部系统 |
| `FileChanged` | 监听文件变化时 | ❌ 否 | 文件变化响应 |

### 限制说明
- `SessionStart` 和 `Setup` 事件**只支持** `command` 和 `mcp_tool` 类型的 handler
- `FileChanged` 的 matcher 是**文件名列表**（如 `".env|.envrc"`），不是工具名

---

## 五、Matcher 规则

| Matcher 值 | 匹配逻辑 |
|-----------|---------|
| 省略 / `""` / `"*"` | 匹配所有 |
| 纯字母数字下划线 | 精确匹配（如 `"Bash"`） |
| `\|` 分隔 | OR 匹配（如 `"Edit\|Write"`） |
| 含其他字符 | 当作 JavaScript 正则（如 `"^mcp__github__.*"`） |

**各事件的 matcher 含义**：

| 事件 | Matcher 匹配的是 |
|------|-----------------|
| `PreToolUse` / `PostToolUse` | 工具名（`Bash`、`Edit`、`Write`…） |
| `SessionStart` | 启动方式（`startup`、`resume`、`clear`） |
| `Notification` | 通知类型（`permission_prompt`、`idle_prompt`…） |
| `SubagentStart/Stop` | Agent 类型 |
| `FileChanged` | 文件名（精确，支持 `\|` 分隔多个） |
| `ConfigChange` | 配置来源（`user_settings`、`project_settings`…） |

---

## 六、Handler 类型

### 6.1 command（最常用）

```json
{
  "type": "command",
  "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate.sh",
  "args": ["--strict"],
  "timeout": 30,
  "async": false
}
```

| 字段 | 说明 |
|------|------|
| `command` | 必须，Shell 命令或脚本路径 |
| `args` | 参数列表（exec 形式，避免 shell 解析问题） |
| `timeout` | 超时秒数，默认 600s |
| `async` | `true` 则后台运行，不阻塞 Claude |
| `asyncRewake` | `true` 则后台完成后以 exit 2 唤醒 Claude |
| `if` | 权限规则过滤（如 `"Bash(rm *)"`），仅工具事件有效 |

**路径规范**：脚本路径必须使用 `${CLAUDE_PLUGIN_ROOT}/hooks/scripts/xxx.sh`，**禁止**硬编码绝对路径。

### 6.2 http

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/notify",
  "headers": { "Authorization": "Bearer $MY_TOKEN" },
  "allowedEnvVars": ["MY_TOKEN"],
  "timeout": 30
}
```

### 6.3 mcp_tool

```json
{
  "type": "mcp_tool",
  "server": "github",
  "tool": "create_comment",
  "input": { "issue_id": "123", "body": "Auto comment" }
}
```

### 6.4 prompt（谨慎使用）

```json
{
  "type": "prompt",
  "prompt": "评估以下 Bash 命令是否安全：$TOOL_INPUT",
  "model": "claude-haiku-4-5"
}
```

> ⚠️ `prompt` 类型会额外消耗 token，仅在需要模型判断时使用，优先用 `command`。

---

## 七、Handler 输出控制

Hook 脚本通过 **stdout 输出 JSON** 或 **exit code** 向 Claude Code 返回决策。

### 通用输出字段

```json
{
  "continue": true,
  "stopReason": "被 Hook 阻断",
  "suppressOutput": false,
  "additionalContext": "注入 Claude 上下文的文本"
}
```

### PreToolUse 专用（控制工具是否执行）

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "危险命令，已阻断",
    "updatedInput": {}
  }
}
```

`permissionDecision` 取值：`allow` / `deny` / `ask` / `defer`
优先级：`deny` > `defer` > `ask` > `allow`

### PostToolUse 专用（修改 Claude 看到的工具输出）

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "updatedToolOutput": "格式化后的输出内容"
  }
}
```

### 使用 exit code

| exit code | 含义 |
|-----------|------|
| `0` | 允许继续 |
| `2` | 阻断（等同于 `continue: false`） |
| 其他 | 同 exit 0 |

> ⚠️ exit 2 和 JSON 输出**只能选其一**，同时使用时 JSON 被忽略。

---

## 八、脚本开发规范

Hook 脚本放在 `hooks/scripts/` 目录下：

```
hooks/
├── hooks.json
└── scripts/
    ├── validate-bash.sh
    ├── format-on-save.sh
    └── notify.sh
```

### 脚本模板（command 类型）

```bash
#!/usr/bin/env bash
# 脚本通过 stdin 接收 JSON 格式的 hook 输入
# 通过 stdout 输出 JSON 决策
# exit 0 = 允许  exit 2 = 阻断

set -euo pipefail

# 读取 stdin 输入（包含工具名、输入参数等）
INPUT=$(cat)

# 解析需要的字段（需要 jq）
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')

# 业务逻辑
# ...

# 允许执行：输出空或 exit 0
exit 0

# 阻断执行：输出 deny 决策
# echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"原因"}}'
# exit 0
```

### 脚本规范
- 必须有 shebang（`#!/usr/bin/env bash`）
- 使用 `jq` 解析 JSON 输入（命令行依赖需在 README 中说明）
- 路径引用使用 `${CLAUDE_PLUGIN_ROOT}`，不硬编码
- 有副作用的操作（删除、修改）必须加确认逻辑

---

## 九、常用 Hook 模式

### 模式 1：文件保存后格式化（PostToolUse + async）

```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/format.sh",
          "async": true
        }
      ]
    }
  ]
}
```

### 模式 2：阻断危险 Bash 命令（PreToolUse）

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "if": "Bash(rm *)",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/block-rm.sh"
        }
      ]
    }
  ]
}
```

### 模式 3：会话启动注入上下文（SessionStart）

```json
{
  "SessionStart": [
    {
      "matcher": "startup",
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/inject-context.sh"
        }
      ]
    }
  ]
}
```

---

## 十、开发检查清单

新增 Hook 后自检：

- [ ] `hooks.json` 已在 `plugin.json` 的 `hooks` 字段注册
- [ ] 脚本文件放在 `hooks/scripts/` 目录
- [ ] 脚本路径使用 `${CLAUDE_PLUGIN_ROOT}` 而非硬编码路径
- [ ] 脚本有 shebang 行且有执行权限
- [ ] 占位文件（仅含 `$comment`）未注册到 `plugin.json`
- [ ] `prompt` 类型 handler 有充分理由（优先用 `command`）
- [ ] 异步 Hook（`async: true`）不依赖其返回值进行后续操作
- [ ] JSON 格式合法（无注释语法）
