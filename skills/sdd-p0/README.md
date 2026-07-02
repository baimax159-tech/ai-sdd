# p0-skill-setup

P0 development readiness check before starting the SDD workflow. Audits Claude Code extension coverage across four dimensions — Skill, MCP Server, Agent, Hook — and recommends or auto-installs missing components.

## Trigger

- Slash command: `/ai-sdd:p0-skill-setup`
- Keywords: "check skills", "prepare dev environment", "enter P0", "readiness check"

## Coverage Dimensions

| Dimension | What is checked | Installation method |
|-----------|-----------------|---------------------|
| Skill | Coding standards, design patterns, testing, security practice skills | `npx skills add` from curated list, or `npx skills find` |
| MCP Server | codegraph (code analysis), context7 (docs lookup) | run init or write config file |
| Agent | Explore/Plan sub-agents | built-in or install plugin |
| Hook | Code formatting, pre-commit checks | generate config into settings |

## When to Use

- Before starting the SDD workflow (before P1) to ensure the environment is ready
- After initializing a new project to configure the toolchain
- When switching tech stacks to add corresponding extension capabilities
