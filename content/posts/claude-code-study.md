---
title: claude code常用功能笔记
date: 2026-05-19
category: AI编程
tags:
  - claude code
excerpt: Claude Code 完整教程：斜杠命令 & 常用功能
---

# Claude Code 完整教程：斜杠命令 & 常用功能

> Claude Code 是 Anthropic 出品的命令行 AI 编程工具。本教程涵盖所有核心斜杠命令、快捷键、自定义命令及实战场景。

---

## 目录

1. [安装 & 启动](#1-安装--启动)
2. [最常用命令（必学）](#2-最常用命令必学)
3. [会话管理命令](#3-会话管理命令)
4. [代码 & 项目命令](#4-代码--项目命令)
5. [上下文控制](#5-上下文控制)
6. [界面 & 体验命令](#6-界面--体验命令)
7. [捆绑技能（Bundled Skills）](#7-捆绑技能bundled-skills)
8. [自定义斜杠命令](#8-自定义斜杠命令)
9. [键盘快捷键](#9-键盘快捷键)
10. [实战场景工作流](#10-实战场景工作流)
11. [速查表](#11-速查表)

---

## 1. 安装 & 启动

```bash
# 安装（需要 Node.js 18+）
npm install -g @anthropic-ai/claude-code

# 启动方式
cd your-project

claude                          # 交互模式（最常用）
claude "帮我修复 auth 模块的 bug"  # 带初始提示词启动
claude -p "分析这段代码的性能"      # 一次性查询，不建立会话
claude -c                        # 继续上次会话
```

> **Tips**：始终在项目目录下启动，不要在桌面或用户根目录启动。

---

## 2. 最常用命令（必学）

### `/init` — 初始化项目

```
/init
```

扫描项目结构，自动生成 `CLAUDE.md` 配置文件，包含：
- 项目描述和技术栈
- 常用命令（build / test / lint）
- 代码规范
- 需要避免的操作

> **重要**：生成后务必手动检查并定制 `CLAUDE.md`，这是 Claude 的"宪法"，每次会话启动时都会读取。

---

### `/clear` — 清空对话

```
/clear       # 别名：/reset、/new
```

清空对话历史，释放 token，重新开始。适合任务切换或接近上下文限制时使用。注意：不会结束会话，只清空记忆。

---

### `/compact` — 压缩上下文

```
/compact
/compact 重点保留关于数据库设计的讨论   # 带保留指令
```

压缩对话上下文，保留核心信息，节省 token。比 `/clear` 好——不会丢失关键内容。

---

### `/help` — 查看所有命令

```
/help          # 显示全部命令列表
/com           # 输入 / 后过滤，自动补全
```

---

### `/cost` — 查看费用

```
/cost          # 显示本次会话的详细 token 用量和花费
```

---

### `/doctor` — 诊断安装

```
/doctor        # 检查安装、配置、网络连接是否正常
```

遇到任何问题时，首先运行这个命令。

---

## 3. 会话管理命令

### `/fork` — 分叉会话

```
/fork 试验方案A    # 别名：/branch
```

从当前对话状态创建一个分支会话，适合同时探索多种解决方案，互不干扰。

---

### `/resume` — 恢复会话

```
/resume              # 打开会话选择器
/resume abc123       # 按会话 ID 恢复
/resume 重构任务      # 按名称恢复
```

别名：`/continue`

---

### `/rename` — 命名会话

```
/rename 登录模块重构    # 手动命名
/rename                 # 不带参数则自动从对话内容生成名称
```

---

### `/rewind` — 回退历史

```
/rewind    # 别名：/checkpoint
```

回退对话和代码文件到某个历史节点，比 `git reset` 更方便。Claude 做了错误修改时使用。

---

### `/plan` — 先规划再执行

```
/plan 重构用户认证系统
```

进入计划模式，Claude 展示完整执行计划后等待确认，再进行文件修改。大型任务前强烈推荐。

---

### `/export` — 导出对话

```
/export                  # 弹出对话框
/export session-notes.txt  # 直接写入文件
```

---

### `/tasks` — 管理后台任务

```
/tasks    # 列出所有正在运行的后台任务
```

---

### `/stats` — 使用统计

```
/stats    # 可视化：日均用量、连续使用天数、模型偏好
```

---

## 4. 代码 & 项目命令

### `/review` — 代码审查

```
/review
```

自动读取 `git diff`，从代码质量、安全性、性能、测试覆盖度四个维度给出具体建议。提交前必跑。

---

### `/security-review` — 安全扫描

```
/security-review
```

专项检测注入漏洞、权限问题、数据暴露等安全风险。

---

### `/diff` — 交互式 Diff

```
/diff    # 用方向键在变更间导航
```

查看所有未提交的变更和每轮对话的 diff。

---

### `/pr-comments` — 加载 PR 评论

```
/pr-comments             # 自动检测当前分支的 PR
/pr-comments 42          # 指定 PR 编号
/pr-comments https://github.com/org/repo/pull/42
```

加载后直接说"帮我解决这些 review 意见"即可。

---

### `/memory` — 编辑记忆文件

```
/memory    # 编辑 CLAUDE.md，开关自动记忆，查看已记录内容
```

定期检查 Claude 积累的记忆，删掉过时的，添加重要规范。

---

### `/hooks` — 查看自动化钩子

```
/hooks    # 查看编辑前/后的自动触发脚本配置
```

例如：每次编辑文件后自动运行 Prettier。

---

### `/permissions` — 工具权限管理

```
/permissions    # 别名：/allowed-tools
```

查看或修改 Claude 可以使用的工具（bash 命令、文件读写等）。

---

### `/add-dir` — 添加工作目录

```
/add-dir ../shared-lib    # 添加共享库目录
/add-dir /path/to/docs    # 添加文档目录
```

适合 monorepo 或跨目录任务。

---

### `/mcp` — 管理 MCP 服务器

```
/mcp                       # 管理 MCP 服务器连接和 OAuth 认证
/mcp__github__list_prs     # 调用 GitHub MCP 的命令（格式示例）
```

---

### `/install-github-app` — 配置自动 PR 审查

```
/install-github-app
```

配置后，Claude 自动审查每个 PR，检测 bug 和安全问题。

---

## 5. 上下文控制

### `/context` — 可视化上下文

```
/context    # 显示颜色网格：绿=空闲 黄=使用中 红=快满了
```

附带优化建议，提示哪些内容可以清除。

---

### `/btw` — 任务中插话

```
/btw 这个函数的时间复杂度是多少？
```

Claude 正在执行长任务时，不打断主任务地提一个旁白问题。

---

### `/usage` — 配额状态

```
/usage    # 当前计划的配额使用情况和限速状态
```

---

### `/insights` — 使用模式分析

```
/insights    # 生成报告：常处理的代码区域、交互模式、效率瓶颈
```

---

### `/copy` — 复制回复

```
/copy    # 复制上一条回复；有多个代码块时弹出选择器
```

---

### `/remote-control` — 远程控制

```
/remote-control           # 别名：/rc
/remote-control 我的任务   # 命名后更容易在 claude.ai 找到
```

让当前会话可以从 claude.ai 或 Claude App 远程监控和控制。

---

## 6. 界面 & 体验命令

### `/model` — 切换模型

```
/model                   # 打开模型选择器
/model claude-opus-4-6   # 直接指定模型
```

在选择器中用左右箭头调整 effort 等级，立即生效。

---

### `/effort` — 思考深度

```
/effort low     # 快速简单任务
/effort medium  # 默认
/effort high    # 复杂任务（持久化跨会话）
/effort xhigh   # 仅 Opus 4.7
/effort max     # 最大深度，仅 Opus（当前会话有效）
/effort auto    # 重置为默认
```

---

### `/color` — 提示栏颜色

```
/color red      # 生产环境用红色提醒
/color blue     # 开发环境
/color default  # 恢复默认
# 支持：red blue green yellow purple orange pink cyan
```

多个终端窗口同时开时，用颜色区分环境，避免搞混。

---

### `/theme` — 切换主题

```
/theme    # 选择 light / dark / 色盲模式 / ANSI 主题
```

---

### `/voice` — 语音输入

```
/voice    # 进入语音模式，按住空格键说话，松开发送
          # 支持 20+ 种语言，包括中文
```

---

### `/vim` — Vim 键位模式

```
/vim    # 切换 Vim / 普通编辑模式
```

---

## 7. 捆绑技能（Bundled Skills）

捆绑技能是 prompt 驱动的增强命令，可以调用多个 agent 并行工作，比普通命令更智能。

### `/batch` — 并行大规模修改

```
/batch "将 src/ 下所有组件从 Solid 迁移到 React"
/batch "给所有 API 接口添加 TypeScript 类型"
/batch "把所有 var 替换成 const/let"
```

将大任务自动拆分为 5-30 个子任务，每个在独立的 git worktree 中并行执行，完成后自动创建 PR。适合大规模机械性修改，可节省数小时工作。

---

### `/debug` — 系统性调试

```
/debug
/debug "数据库连接池在高并发下报错"
```

系统地诊断当前错误，分析根因并给出修复方案。

---

### `/simplify` — 简化重构

```
/simplify    # 分析并简化当前代码库
```

---

### `/claude-api` — 加载 API 文档

```
/claude-api    # 加载 Claude Python/TS SDK 参考文档到上下文
               # 当代码中有 import anthropic 时自动触发
```

---

## 8. 自定义斜杠命令

### 目录结构

```
# 项目级命令（git 共享，团队所有人可用）
.claude/commands/
  ├── review.md       # → /review
  ├── test.md         # → /test
  └── commit.md       # → /commit

# 个人级命令（跨所有项目可用）
~/.claude/commands/
  └── my-helper.md    # → /my-helper
```

### 创建方法

文件名即命令名，内容为自然语言指令。支持：
- `$ARGUMENTS` 占位符接收参数
- YAML 前置元数据配置权限、描述、模型等

### 示例一：代码审查命令

```markdown
<!-- .claude/commands/review.md -->
---
allowed-tools: Read, Grep, Glob, Bash(git diff *)
description: 全面代码审查
---

## 变更文件
!`git diff --name-only HEAD~1`

## 详细变更
!`git diff HEAD~1`

## 审查维度
1. 代码质量和可读性
2. 安全漏洞
3. 性能影响
4. 测试覆盖度

请按优先级给出具体、可操作的建议。
```

使用：`/review`

---

### 示例二：带参数的测试命令

```markdown
<!-- .claude/commands/test.md -->
---
allowed-tools: Bash, Read, Edit
argument-hint: [test-pattern]
description: 运行并修复测试
---

运行匹配以下模式的测试：$ARGUMENTS

1. 检测测试框架（Jest/pytest 等）
2. 运行测试
3. 如果失败，分析并修复
4. 重新运行确认通过
```

使用：`/test auth` → `$ARGUMENTS = "auth"`

---

### 示例三：智能提交命令

```markdown
<!-- .claude/commands/commit.md -->
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [commit message]
description: 智能 git 提交
---

1. 运行 git status 查看变更
2. 运行 git diff 理解改动内容
3. 如果提供了 $ARGUMENTS 则用它作为提交信息，
   否则根据变更自动生成符合规范的提交信息
4. git add -A 并提交
```

使用：`/commit` 或 `/commit fix: 修复登录超时问题`

---

### 示例四：性能优化命令

```markdown
<!-- .claude/commands/optimize.md -->
---
description: 分析并优化代码性能
---

分析以下目标的性能问题：$ARGUMENTS

请重点关注：
- 时间复杂度
- 内存使用
- 数据库查询效率
- 不必要的重复计算
```

使用：`/optimize src/api/users.ts`

---

## 9. 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Option+T` / `Alt+T` | 开启 Extended Thinking（深度思考模式） |
| `Option+P` / `Alt+P` | 打开模型选择器 |
| `Ctrl+G` | 在外部编辑器中打开当前输入 |
| `Shift+Tab` | 切换权限模式（自动/手动确认） |
| `Ctrl+C` | 中断当前任务 |
| `Shift+Enter` | 多行输入（需先运行 `/terminal-setup`） |

---

## 10. 实战场景工作流

### 场景一：新项目初始化

```
1. cd your-project && claude
2. /init                         # 生成 CLAUDE.md
3. /doctor                       # 确认安装正常
4. 手动编辑 CLAUDE.md，补充团队规范
5. /rename 项目初始化              # 命名会话
```

---

### 场景二：日常 Code Review

```
1. /diff                         # 查看变更详情
2. /review                       # 全面代码审查
3. /security-review              # 安全专项检查
4. /pr-comments 42               # 加载 PR 评论
   → "帮我解决所有评论问题"
5. /commit                       # 智能提交（自定义命令）
```

---

### 场景三：大规模重构

```
1. /plan 将 API 从 REST 迁移到 GraphQL   # 先规划
2. 确认计划后：
   /batch "迁移所有 REST 端点到 GraphQL"  # 并行执行
3. 出错时回退：
   /rewind                                # 回到安全节点
4. 探索另一方案：
   /fork 方案B                            # 分叉会话
```

---

### 场景四：长任务 Token 管理

```
1. 定期检查：/cost 和 /context
2. 快满时：/compact 保留关于数据库设计的讨论
3. 换任务时：/clear
4. 重要对话备份：/export session-notes.txt
```

---

### 场景五：CLAUDE.md 配置最佳实践

```markdown
# CLAUDE.md 示例模板

## 项目概述
Next.js 15 + TypeScript + Prisma 的 SaaS 项目

## 常用命令
- 构建: `npm run build`
- 测试: `npm test -- --watch`
- 代码检查: `npm run lint --fix`
- 数据库迁移: `npx prisma migrate dev`

## 代码规范
- TypeScript strict 模式，禁止 any
- 禁止 default export
- 提交格式: feat/fix/chore(scope): description
- 组件用 .tsx，工具函数用 .ts

## 注意事项
- 不要修改 /src/lib/auth.ts（由安全团队维护）
- 数据库操作必须用事务
- API 路由必须验证 zod schema
```

---

## 11. 速查表

### 会话控制

| 命令 | 说明 |
|------|------|
| `/init` | 初始化项目 CLAUDE.md |
| `/clear` | 清空对话（别名：reset / new） |
| `/compact [说明]` | 压缩上下文，节省 token |
| `/fork [名称]` | 分叉出新会话 |
| `/resume [ID/名]` | 恢复历史会话 |
| `/rename [名称]` | 给会话命名 |
| `/rewind` | 回退到历史节点 |
| `/plan [描述]` | 先规划再执行 |
| `/export [文件名]` | 导出对话记录 |

### 代码 & 项目

| 命令 | 说明 |
|------|------|
| `/review` | 代码审查 |
| `/security-review` | 安全漏洞扫描 |
| `/diff` | 交互式 diff 查看 |
| `/pr-comments [PR]` | 加载 PR 评论 |
| `/memory` | 编辑 CLAUDE.md |
| `/hooks` | 查看自动化钩子 |
| `/permissions` | 工具权限管理 |
| `/add-dir [路径]` | 添加工作目录 |
| `/mcp` | 管理 MCP 服务器 |

### 捆绑技能

| 命令 | 说明 |
|------|------|
| `/batch [指令]` | 并行大规模修改 |
| `/debug [描述]` | 系统性调试 |
| `/simplify` | 简化重构代码 |
| `/claude-api` | 加载 API 参考文档 |

### 监控 & 诊断

| 命令 | 说明 |
|------|------|
| `/cost` | token 用量和花费 |
| `/context` | 可视化上下文用量 |
| `/usage` | 计划配额用量 |
| `/stats` | 使用统计图表 |
| `/doctor` | 诊断安装问题 |
| `/insights` | 使用模式分析 |

### 界面 & 体验

| 命令 | 说明 |
|------|------|
| `/model [模型]` | 切换 AI 模型 |
| `/effort [级别]` | 思考深度 low→max |
| `/color [颜色]` | 提示栏颜色 |
| `/theme` | 切换 light/dark |
| `/voice` | 语音输入模式 |
| `/vim` | Vim 键位模式 |
| `/copy` | 复制上条回复 |
| `/btw [问题]` | 任务进行中插话 |

---

## 🏆 高效使用黄金法则

1. **新项目必先 `/init`**，然后手动完善 `CLAUDE.md`
2. **长任务定期 `/compact`**，不要等满了再处理
3. **大改动前先 `/plan`**，确认思路再执行
4. **提交前跑 `/review` + `/security-review`**
5. **多终端开着时用 `/color`** 区分生产/开发环境
6. **用自定义命令沉淀团队最佳实践**，放进 `.claude/commands/`

---

> 官方文档：[docs.claude.com/en/docs/claude-code/overview](https://docs.claude.com/en/docs/claude-code/overview)
