# p0-skill-setup 技能

SDD 流程前的开发能力就绪检查。从 Skill、MCP Server、Agent、Hook 四个维度检查项目的 Claude Code 扩展能力覆盖度，推荐并自动安装缺失项。

## 触发方式

- 斜杠命令：`/forge-sdd:p0-skill-setup`
- 关键词：说"检查技能"、"准备开发环境"、"进入 P0"、"能力检查"

## 检查维度

| 维度 | 检查内容 | 安装方式 |
|------|----------|----------|
| Skill | 编码规范、设计模式、测试、安全等实践 skill | 有精选清单用 `npx skills add`，无则 `npx skills find` |
| MCP Server | codegraph（代码分析）、context7（文档查询） | 执行 init 或写入配置文件 |
| Agent | Explore/Plan 等子代理 | 内置或安装 plugin |
| Hook | 代码格式化、提交前检查 | 生成配置写入 settings |

## 使用场景

- SDD 流程开始前（P1 之前）确保环境就绪
- 新项目初始化后配置开发工具链
- 切换技术栈后补充对应扩展能力
