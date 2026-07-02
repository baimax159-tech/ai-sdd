# 插件仓库规则

## 目录结构（单插件根目录模式）

```
ai-sdd/
├── .claude-plugin/
│   └── plugin.json          ← 唯一插件配置（版本在此管理）
├── skills/                  ← 技能（sdd-p0 ~ sdd-p5）
├── commands/                ← 斜杠命令（help.md）
├── agents/                  ← Agent 定义（暂未注册）
├── hooks/                   ← Hook 配置（暂未注册）
└── scripts/                 ← SDD CLI 工具
```

禁止将 skills/、commands/ 放进 .claude-plugin/ 内。

## plugin.json 当前状态

文件位置：.claude-plugin/plugin.json

当前已注册组件：
- `"commands": ["./commands/help.md"]`

未注册（占位）：agents/、hooks/

## 版本管理

| 变更类型 | 版本位 |
|----------|--------|
| 新增技能、新增命令 | minor +1 |
| Bug 修复 | patch +1 |
| 删除/重命名技能 | major +1 |

version 只在 plugin.json 中设置，不在其他地方重复。

## 新增组件后检查清单

- [ ] name 与实际插件名一致（ai-sdd）
- [ ] version 已按变更类型 Bump
- [ ] 已注册的组件路径实际存在
- [ ] 占位文件（仅含注释的 JSON）未被注册
- [ ] JSON 格式合法（无尾随逗号、无注释）
- [ ] node scripts/validate.js 通过
