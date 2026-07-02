# Hook 开发规则

## 文件位置

hooks/hooks.json  （根目录下的 hooks/ 目录）

注册到 .claude-plugin/plugin.json：
  "hooks": "./hooks/hooks.json"

占位文件（仅含 $comment）不注册。

## 配置结构

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<工具名或正则>",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/<script>.sh",
            "timeout": 30,
            "async": false
          }
        ]
      }
    ]
  }
}
```

## 常用事件

| 事件 | 触发时机 | 能否阻断 |
|------|----------|----------|
| `PreToolUse` | 工具调用前 | ✅ |
| `PostToolUse` | 工具调用成功后 | ❌ |
| `SessionStart` | 会话开始/恢复时 | ❌ |
| `Stop` | Claude 完成回复时 | ✅ |

## 脚本路径规范

必须用 `${CLAUDE_PLUGIN_ROOT}/hooks/scripts/xxx.sh`，禁止硬编码绝对路径。
脚本放在 hooks/scripts/ 目录，必须有 shebang 行。

## PreToolUse 阻断输出格式

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "原因"
  }
}
```

exit 0 允许，exit 2 阻断（不能同时输出 JSON）。

## 检查清单

- [ ] hooks.json 在根目录 hooks/ 下
- [ ] 已在 .claude-plugin/plugin.json 的 hooks 字段注册
- [ ] 脚本路径使用 ${CLAUDE_PLUGIN_ROOT}，无硬编码
- [ ] 脚本有 shebang 行
- [ ] 占位文件未注册
- [ ] JSON 格式合法（无注释）
