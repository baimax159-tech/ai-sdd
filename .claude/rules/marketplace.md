# Marketplace 规则

> 指导 Claude Code 维护 `.claude-plugin/marketplace.json` 清单。清单只做「索引」，不含技能逻辑。

---

## 一、当前模板（与仓库实际一致）

```json
{
  "$schema": "https://json.schemastore.org/claude-code-marketplace.json",
  "name": "claude-forge",
  "owner": { "name": "Max Bai", "email": "baimax159@gmail.com" },
  "description": "claude-forge: a Claude Code plugin marketplace providing efficient skills and extensions for development workflows",
  "metadata": {},
  "plugins": [
    { "name": "forge-dev", "source": "./plugins/forge-dev" },
    { "name": "forge-sdd", "source": "./plugins/forge-sdd" }
  ]
}
```

插件条目保持最小形态（`name` + `source`），展示用元数据（description/author/license 等）已在各自 `plugin.json` 中维护，无需在此重复。

---

## 二、字段规范

### 顶层

| 字段 | 必须 | 说明 |
|------|------|------|
| `name` | ✅ | kebab-case，Marketplace 唯一标识 |
| `owner.name` | ✅ | 维护者或团队名 |
| `plugins` | ✅ | 插件条目数组，至少 1 项 |
| `$schema` | 推荐 | JSON Schema URL，编辑器补全用 |
| `description` | 推荐 | Marketplace 简介 |
| `metadata` | 可选 | 可留空 `{}`。仅当用简写 source 时才需 `pluginRoot`（见下） |

### 插件条目（plugins[]）

| 字段 | 必须 | 说明 |
|------|------|------|
| `name` | ✅ | 插件标识，kebab-case |
| `source` | ✅ | 插件来源，见「三、source 格式」 |
| `description` / `author` / `license` / `keywords` / `category` | 可选 | 展示元数据，本仓库不在此设置（由 `plugin.json` 维护） |

> **`version` 字段**：Claude Code 官方**允许**在插件条目设置 `version`，但**本项目约定不设置**——版本单一来源为 `plugin.json`，避免双写漂移。这是项目约定，非官方限制。

---

## 三、source 格式

### 本地路径（当前使用方式）

```json
"source": "./plugins/forge-dev"
```

- 相对 **marketplace 根目录**解析（不是相对 `.claude-plugin/`）
- 不可含 `../` 指向父目录
- 简写形式 `"source": "forge-dev"` 也支持，但需配 `metadata.pluginRoot: "./plugins"`；本仓库统一用全路径写法，`metadata` 留空

### 外部来源

```json
"source": { "source": "github", "repo": "owner/repo", "ref": "main" }
```

```json
"source": { "source": "url", "url": "https://git.example.com/repo.git", "path": "packages/my-plugin", "ref": "main" }
```

---

## 四、strict 模式

默认 `true`：`plugin.json` 为权威来源，marketplace 条目可叠加额外字段。本仓库插件**不设置 `strict`**，用默认值。仅在引用无 `plugin.json` 的外部插件时才用 `false`。

---

## 五、保留名称（禁止使用）

以下名称被官方保留，不可作为 marketplace `name`：
`claude-code-marketplace`、`claude-code-plugins`、`claude-plugins-official`、`anthropic-marketplace`、`anthropic-plugins`、`agent-skills`、`knowledge-work-plugins`、`life-sciences`，以及任何仿冒官方的名称。

---

## 六、新增插件到 marketplace

在 `plugins` 数组追加条目，并确认 `./plugins/<new-plugin-name>/.claude-plugin/plugin.json` 存在：

```json
{ "name": "<new-plugin-name>", "source": "./plugins/<new-plugin-name>" }
```

---

## 七、修改检查清单

- [ ] 顶层与每个插件条目均未设置 `version`
- [ ] `source` 全路径对应的 `./plugins/<name>/` 目录实际存在
- [ ] `name` 未使用官方保留名称
- [ ] JSON 格式合法（无尾随逗号、无注释）
- [ ] `claude plugin validate .` 通过
