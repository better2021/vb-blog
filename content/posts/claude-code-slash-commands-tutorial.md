---
title: claude-code教程
date: 2026-05-19
category: AI
tags:
  - claude-code
excerpt: claude-code 可视化教程
---

<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font-sans);color:var(--color-text-primary);font-size:14px}
h2{font-size:18px;font-weight:500;margin-bottom:1rem}
h3{font-size:15px;font-weight:500}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.5rem;border-bottom:0.5px solid var(--color-border-tertiary);padding-bottom:0.75rem}
.tab{padding:6px 14px;border-radius:var(--border-radius-md);border:0.5px solid var(--color-border-tertiary);cursor:pointer;font-size:13px;background:var(--color-background-primary);color:var(--color-text-secondary);transition:all .15s}
.tab.active{background:#EEEDFE;color:#3C3489;border-color:#AFA9EC;font-weight:500}
.tab:hover:not(.active){background:var(--color-background-secondary)}
.section{display:none}
.section.active{display:block}
.cmd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;margin-bottom:1.5rem}
.cmd-card{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:12px 14px;cursor:pointer;transition:all .15s}
.cmd-card:hover{border-color:var(--color-border-secondary);background:var(--color-background-secondary)}
.cmd-card.expanded{border-color:#AFA9EC;background:#EEEDFE}
.cmd-header{display:flex;align-items:center;gap:8px}
.cmd-name{font-family:var(--font-mono);font-size:13px;font-weight:500;color:#3C3489;background:#E8E6FD;padding:2px 8px;border-radius:4px}
.cmd-desc{font-size:12px;color:var(--color-text-secondary);margin-top:6px;line-height:1.5}
.cmd-detail{display:none;margin-top:10px;padding-top:10px;border-top:0.5px solid #AFA9EC}
.cmd-card.expanded .cmd-detail{display:block}
.example{background:#26215C;color:#CECBF6;font-family:var(--font-mono);font-size:12px;padding:8px 10px;border-radius:6px;margin-top:6px;white-space:pre-wrap;line-height:1.6}
.example .cmt{color:#7F77DD}
.tip{background:#E1F5EE;border:0.5px solid #5DCAA5;border-radius:6px;padding:8px 10px;font-size:12px;color:#085041;margin-top:6px;line-height:1.5}
.badge{font-size:11px;padding:2px 6px;border-radius:4px;font-weight:500}
.badge-new{background:#EAF3DE;color:#3B6D11}
.badge-popular{background:#FAECE7;color:#712B13}
.cheat{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:14px}
.cheat-row{display:flex;align-items:baseline;gap:10px;padding:5px 0;border-bottom:0.5px solid var(--color-border-tertiary)}
.cheat-row:last-child{border-bottom:none}
.cheat-cmd{font-family:var(--font-mono);font-size:12px;color:#3C3489;background:#EEEDFE;padding:1px 6px;border-radius:3px;min-width:160px;flex-shrink:0}
.cheat-note{font-size:12px;color:var(--color-text-secondary);line-height:1.4}
.scenario{background:var(--color-background-secondary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:14px;margin-bottom:10px}
.scenario h4{font-size:13px;font-weight:500;margin-bottom:8px;color:var(--color-text-primary)}
.flow{display:flex;flex-direction:column;gap:4px}
.flow-step{display:flex;align-items:flex-start;gap:8px;font-size:12px}
.step-num{background:#534AB7;color:#EEEDFE;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;flex-shrink:0;margin-top:1px}
.step-text{color:var(--color-text-secondary);line-height:1.5;padding-top:1px}
.step-code{font-family:var(--font-mono);font-size:11px;color:#3C3489;background:#EEEDFE;padding:1px 5px;border-radius:3px}
.config-block{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:14px;margin-bottom:10px}
.config-block h4{font-size:13px;font-weight:500;margin-bottom:10px}
pre.code-block{background:#26215C;color:#CECBF6;font-family:var(--font-mono);font-size:11px;padding:10px 12px;border-radius:6px;white-space:pre;overflow-x:auto;line-height:1.7}
.kv{color:#9FE1CB}.punct{color:#7F77DD}.val{color:#FAC775}.cmt2{color:#534AB7}
.search-bar{display:flex;gap:8px;margin-bottom:1rem}
.search-bar input{flex:1;padding:8px 12px;border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);background:var(--color-background-primary);color:var(--color-text-primary);font-size:13px}
.hidden{display:none!important}
.section-label{font-size:11px;font-weight:500;color:var(--color-text-tertiary);text-transform:uppercase;letter-spacing:.06em;margin:1rem 0 6px}
</style>

<h2 style="padding-top:0.5rem"><i class="ti ti-terminal-2" aria-hidden="true" style="font-size:20px;vertical-align:-2px;margin-right:8px;color:#534AB7"></i>Claude Code 完整教程</h2>

<div class="tabs">
  <div class="tab active" onclick="switchTab('quick')">⚡ 快速上手</div>
  <div class="tab" onclick="switchTab('session')">📋 会话管理</div>
  <div class="tab" onclick="switchTab('code')">🔧 代码 & 项目</div>
  <div class="tab" onclick="switchTab('context')">🧠 上下文控制</div>
  <div class="tab" onclick="switchTab('custom')">✨ 自定义命令</div>
  <div class="tab" onclick="switchTab('scenarios')">🎯 实战场景</div>
  <div class="tab" onclick="switchTab('cheatsheet')">📄 速查表</div>
</div>

<div id="quick" class="section active">
  <div style="background:#EEEDFE;border:0.5px solid #AFA9EC;border-radius:var(--border-radius-lg);padding:14px;margin-bottom:1.5rem">
    <h3 style="color:#3C3489;margin-bottom:8px"><i class="ti ti-rocket" aria-hidden="true" style="margin-right:6px"></i>安装 & 启动</h3>
    <div class="example"><span class="cmt"># 安装（需要 Node.js 18+）</span>
npm install -g @anthropic-ai/claude-code

<span class="cmt"># 在项目目录启动</span>
cd your-project
claude                         <span class="cmt"># 交互模式</span>
claude "帮我修复 auth 模块的 bug"  <span class="cmt"># 直接带提示词启动</span>
claude -p "分析这段代码的性能"      <span class="cmt"># 一次性查询，无会话</span>
claude -c                      <span class="cmt"># 继续上次会话</span></div>
  </div>
  <p class="section-label">最常用的命令（每天都会用到）</p>
  <div class="cmd-grid">
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/init</span><span class="badge badge-popular">必学</span></div>
      <div class="cmd-desc">初始化项目，生成 CLAUDE.md 配置文件</div>
      <div class="cmd-detail">
        <div class="example"><span class="cmt"># 在新项目第一次使用</span>
/init
<span class="cmt"># Claude 会扫描项目结构，生成：</span>
<span class="cmt"># - 项目描述</span>
<span class="cmt"># - 常用命令（build/test/lint）</span>
<span class="cmt"># - 代码规范</span>
<span class="cmt"># - 需要避免的操作</span></div>
        <div class="tip">💡 生成后务必手动检查并定制 CLAUDE.md，这是 Claude 的"宪法"，每次会话都会读取。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/clear</span><span class="badge badge-popular">高频</span></div>
      <div class="cmd-desc">清空对话历史，释放 token，重新开始</div>
      <div class="cmd-detail">
        <div class="example">/clear    <span class="cmt"># 别名: /reset, /new</span>
<span class="cmt"># 适合：任务切换时，或接近上下文限制时</span>
<span class="cmt"># 注意：不会结束会话，只清空记忆</span></div>
        <div class="tip">💡 快到消息上限了？先 /compact 压缩，再 /clear 清空。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/compact</span><span class="badge badge-popular">省 token</span></div>
      <div class="cmd-desc">压缩对话上下文，保留要点，节省 token</div>
      <div class="cmd-detail">
        <div class="example">/compact
<span class="cmt"># 带指令的压缩（保留特定内容）</span>
/compact 重点保留关于数据库设计的讨论</div>
        <div class="tip">💡 长时间工作后使用，比 /clear 好，因为会保留关键信息。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/help</span></div>
      <div class="cmd-desc">显示所有可用命令列表</div>
      <div class="cmd-detail">
        <div class="example">/help          <span class="cmt"># 显示全部命令</span>
<span class="cmt"># 或直接输入 / 然后过滤</span>
/com           <span class="cmt"># 自动补全显示含 com 的命令</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/cost</span></div>
      <div class="cmd-desc">查看本次会话的 token 消耗和费用</div>
      <div class="cmd-detail">
        <div class="example">/cost   <span class="cmt"># 显示详细 token 用量和花费统计</span></div>
        <div class="tip">💡 长时间任务后用来监控消耗，及时 /compact 优化。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/doctor</span></div>
      <div class="cmd-desc">诊断 Claude Code 安装是否正常</div>
      <div class="cmd-detail">
        <div class="example">/doctor   <span class="cmt"># 检查：安装、配置、网络连接</span>
<span class="cmt"># 遇到问题时首先运行这个</span></div>
      </div>
    </div>
  </div>
</div>

<div id="session" class="section">
  <p class="section-label">会话管理命令</p>
  <div class="cmd-grid">
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/fork</span><span class="badge badge-new">实用</span></div>
      <div class="cmd-desc">从当前对话分叉出一个新会话</div>
      <div class="cmd-detail">
        <div class="example">/fork 试验方案A
<span class="cmt"># 在同一个项目状态下，创建分支对话</span>
<span class="cmt"># 适合：想同时探索两种不同的解决方案</span>
<span class="cmt"># 别名: /branch</span></div>
        <div class="tip">💡 设计方案时，fork 两个分支分别讨论，不互相干扰。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/resume</span></div>
      <div class="cmd-desc">恢复之前的会话</div>
      <div class="cmd-detail">
        <div class="example">/resume            <span class="cmt"># 打开会话选择器</span>
/resume abc123    <span class="cmt"># 按会话 ID 恢复</span>
/resume 重构任务   <span class="cmt"># 按名称恢复</span>
<span class="cmt"># 别名: /continue</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/rename</span></div>
      <div class="cmd-desc">给当前会话命名，便于之后恢复</div>
      <div class="cmd-detail">
        <div class="example">/rename 登录模块重构
<span class="cmt"># 不带名称则自动从对话内容生成名称</span>
/rename</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/rewind</span></div>
      <div class="cmd-desc">回退对话和代码到某个历史节点</div>
      <div class="cmd-detail">
        <div class="example">/rewind   <span class="cmt"># 别名: /checkpoint</span>
<span class="cmt"># 选择要回退到的时间点</span>
<span class="cmt"># 代码文件也会一起还原</span></div>
        <div class="tip">💡 Claude 做了错误修改？用 /rewind 撤回，比 git reset 更方便。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/export</span></div>
      <div class="cmd-desc">将对话导出为纯文本文件</div>
      <div class="cmd-detail">
        <div class="example">/export              <span class="cmt"># 弹出对话框</span>
/export session.txt  <span class="cmt"># 直接写入文件</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/plan</span></div>
      <div class="cmd-desc">进入"计划模式"，只规划不执行</div>
      <div class="cmd-detail">
        <div class="example">/plan 重构用户认证系统
<span class="cmt"># Claude 会先展示计划，等你确认后再执行</span>
<span class="cmt"># 避免 Claude 直接修改文件，适合大任务</span></div>
        <div class="tip">💡 大型重构前先用 /plan 确认思路，避免后悔。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/tasks</span></div>
      <div class="cmd-desc">查看和管理后台任务</div>
      <div class="cmd-detail">
        <div class="example">/tasks   <span class="cmt"># 列出所有后台运行的任务</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/stats</span></div>
      <div class="cmd-desc">可视化使用数据：日均用量、连续使用天数等</div>
      <div class="cmd-detail">
        <div class="example">/stats   <span class="cmt"># 展示使用折线图、模型偏好、历史记录</span></div>
      </div>
    </div>
  </div>
  <p class="section-label">界面 & 体验</p>
  <div class="cmd-grid">
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/model</span></div>
      <div class="cmd-desc">切换 AI 模型，立即生效</div>
      <div class="cmd-detail">
        <div class="example">/model                  <span class="cmt"># 打开模型选择器</span>
/model claude-opus-4-6  <span class="cmt"># 指定模型</span>
<span class="cmt"># 在模型选择器中用左右箭头调整 effort 等级</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/effort</span></div>
      <div class="cmd-desc">设置思考深度（影响质量和速度）</div>
      <div class="cmd-detail">
        <div class="example">/effort low     <span class="cmt"># 快速简单任务</span>
/effort medium  <span class="cmt"># 默认</span>
/effort high    <span class="cmt"># 复杂任务（持久化）</span>
/effort max     <span class="cmt"># 最大深度（仅 Opus）</span>
/effort auto    <span class="cmt"># 重置为默认</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/theme</span></div>
      <div class="cmd-desc">切换颜色主题</div>
      <div class="cmd-detail">
        <div class="example">/theme   <span class="cmt"># 选择 light/dark/色盲模式/ANSI 主题</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/color</span></div>
      <div class="cmd-desc">设置提示栏颜色，区分多个会话窗口</div>
      <div class="cmd-detail">
        <div class="example">/color red     <span class="cmt"># 生产环境用红色提醒</span>
/color blue    <span class="cmt"># 开发环境</span>
/color default <span class="cmt"># 恢复默认</span>
<span class="cmt"># 支持: red blue green yellow purple orange pink cyan</span></div>
        <div class="tip">💡 多个终端窗口同时开着时，用颜色区分环境，避免搞混。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/vim</span></div>
      <div class="cmd-desc">切换 Vim 键位模式</div>
      <div class="cmd-detail">
        <div class="example">/vim   <span class="cmt"># 切换 Vim / 普通编辑模式</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/voice</span></div>
      <div class="cmd-desc">语音输入模式（按住空格键说话）</div>
      <div class="cmd-detail">
        <div class="example">/voice   <span class="cmt"># 进入语音模式</span>
<span class="cmt"># 按住空格键说话，松开发送</span>
<span class="cmt"># 支持 20+ 种语言，包括中文</span></div>
      </div>
    </div>
  </div>
</div>

<div id="code" class="section">
  <p class="section-label">代码审查 & 项目命令</p>
  <div class="cmd-grid">
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/review</span><span class="badge badge-popular">常用</span></div>
      <div class="cmd-desc">审查代码变更（自动读取 git diff）</div>
      <div class="cmd-detail">
        <div class="example"><span class="cmt"># 审查当前所有未提交变更</span>
/review
<span class="cmt"># 审查包括：代码质量、安全性、性能、测试覆盖</span></div>
        <div class="tip">💡 提交前运行 /review，相当于一个随时待命的 code reviewer。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/security-review</span><span class="badge badge-new">新</span></div>
      <div class="cmd-desc">专项安全漏洞扫描</div>
      <div class="cmd-detail">
        <div class="example">/security-review
<span class="cmt"># 检测：注入漏洞、权限问题、数据暴露等</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/diff</span></div>
      <div class="cmd-desc">交互式 diff 查看器（未提交变更）</div>
      <div class="cmd-detail">
        <div class="example">/diff   <span class="cmt"># 用方向键在变更间导航</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/pr-comments</span></div>
      <div class="cmd-desc">加载 GitHub PR 评论到上下文</div>
      <div class="cmd-detail">
        <div class="example">/pr-comments          <span class="cmt"># 自动检测当前分支的 PR</span>
/pr-comments 42      <span class="cmt"># 指定 PR 编号</span>
/pr-comments https://github.com/org/repo/pull/42</div>
        <div class="tip">💡 加载 PR 评论后，直接说"帮我解决这些 review 意见"。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/memory</span></div>
      <div class="cmd-desc">编辑 CLAUDE.md 记忆文件</div>
      <div class="cmd-detail">
        <div class="example">/memory   <span class="cmt"># 编辑 CLAUDE.md，开关自动记忆</span>
<span class="cmt"># 可以查看 Claude 自动记录了哪些内容</span></div>
        <div class="tip">💡 定期检查 Claude 积累的记忆，删掉过时的，添加重要规范。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/hooks</span></div>
      <div class="cmd-desc">查看 hook 配置（自动触发的脚本）</div>
      <div class="cmd-detail">
        <div class="example">/hooks   <span class="cmt"># 查看：编辑前/后的自动化钩子</span>
<span class="cmt"># 例如：每次编辑文件后自动运行 Prettier</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/permissions</span></div>
      <div class="cmd-desc">查看/修改工具权限设置</div>
      <div class="cmd-detail">
        <div class="example">/permissions   <span class="cmt"># 别名: /allowed-tools</span>
<span class="cmt"># 控制 Claude 可以使用哪些工具</span>
<span class="cmt"># 如：是否允许运行 bash 命令、读写文件等</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/add-dir</span></div>
      <div class="cmd-desc">添加额外工作目录到当前会话</div>
      <div class="cmd-detail">
        <div class="example">/add-dir ../shared-lib   <span class="cmt"># 添加共享库目录</span>
/add-dir /path/to/docs  <span class="cmt"># 添加文档目录</span>
<span class="cmt"># 适合 monorepo 或跨目录任务</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/install-github-app</span></div>
      <div class="cmd-desc">配置 GitHub 自动 PR 审查</div>
      <div class="cmd-detail">
        <div class="example">/install-github-app
<span class="cmt"># 配置后，Claude 自动审查每个 PR</span>
<span class="cmt"># 检测 bug、安全问题等</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/mcp</span></div>
      <div class="cmd-desc">管理 MCP 服务器连接</div>
      <div class="cmd-detail">
        <div class="example">/mcp   <span class="cmt"># 管理 MCP 服务器、OAuth 认证</span>
<span class="cmt"># MCP 命令格式：</span>
/mcp__github__list_prs    <span class="cmt"># 调用 github MCP 的命令</span></div>
      </div>
    </div>
  </div>
  <p class="section-label">捆绑技能（Bundled Skills）</p>
  <div class="cmd-grid">
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/batch</span><span class="badge badge-new">强大</span></div>
      <div class="cmd-desc">并行大规模变更（自动拆分 + 多 agent）</div>
      <div class="cmd-detail">
        <div class="example"><span class="cmt"># 将大任务拆成 5-30 个并行子任务</span>
/batch "将 src/ 下所有组件从 Solid 迁移到 React"
/batch "给所有 API 接口添加 TypeScript 类型"
/batch "把所有 var 替换成 const/let"
<span class="cmt"># 每个子任务在独立的 git worktree 中运行</span>
<span class="cmt"># 完成后自动创建 PR</span></div>
        <div class="tip">💡 适合大规模机械性修改，可节省数小时工作。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/debug</span></div>
      <div class="cmd-desc">系统性调试当前问题</div>
      <div class="cmd-detail">
        <div class="example">/debug   <span class="cmt"># Claude 会系统地诊断当前错误</span>
/debug "数据库连接池在高并发下报错"</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/simplify</span></div>
      <div class="cmd-desc">简化和重构当前代码</div>
      <div class="cmd-detail">
        <div class="example">/simplify   <span class="cmt"># 分析并简化当前代码库</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/claude-api</span></div>
      <div class="cmd-desc">加载 Claude API 文档到上下文</div>
      <div class="cmd-detail">
        <div class="example">/claude-api   <span class="cmt"># 加载 Python/TS SDK 参考文档</span>
<span class="cmt"># 当代码中有 import anthropic 时自动触发</span></div>
      </div>
    </div>
  </div>
</div>

<div id="context" class="section">
  <p class="section-label">上下文可视化</p>
  <div class="cmd-grid">
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/context</span></div>
      <div class="cmd-desc">可视化上下文窗口使用情况</div>
      <div class="cmd-detail">
        <div class="example">/context   <span class="cmt"># 显示颜色网格 + 优化建议</span>
<span class="cmt"># 绿色 = 空闲，黄色 = 使用中，红色 = 快满了</span></div>
        <div class="tip">💡 快满时自动给出建议：哪些内容可以清除。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/insights</span></div>
      <div class="cmd-desc">分析你的使用模式，找出优化点</div>
      <div class="cmd-detail">
        <div class="example">/insights   <span class="cmt"># 生成分析报告：</span>
<span class="cmt"># - 最常处理的代码区域</span>
<span class="cmt"># - 交互模式</span>
<span class="cmt"># - 效率瓶颈</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/usage</span></div>
      <div class="cmd-desc">查看计划用量限制和限速状态</div>
      <div class="cmd-detail">
        <div class="example">/usage   <span class="cmt"># 当前计划的配额使用情况</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/btw</span></div>
      <div class="cmd-desc">在 Claude 处理任务时插入旁白提问</div>
      <div class="cmd-detail">
        <div class="example"><span class="cmt"># Claude 正在运行一个长任务时</span>
/btw 这个函数的时间复杂度是多少？
<span class="cmt"># 不打断主任务，只是旁边问一句</span></div>
        <div class="tip">💡 Claude 跑长任务时你可以用 /btw 提问，不影响主流程。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/copy</span></div>
      <div class="cmd-desc">复制上一条回复到剪贴板</div>
      <div class="cmd-detail">
        <div class="example">/copy   <span class="cmt"># 如果有多个代码块，会弹出选择器</span>
<span class="cmt"># 可选：复制某个代码块 or 整个回复</span></div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">/remote-control</span></div>
      <div class="cmd-desc">让会话可以从 claude.ai 远程控制</div>
      <div class="cmd-detail">
        <div class="example">/remote-control          <span class="cmt"># 别名: /rc</span>
/remote-control 我的任务  <span class="cmt"># 命名后更容易找到</span>
<span class="cmt"># 适合：在手机上监控终端任务</span></div>
      </div>
    </div>
  </div>
  <p class="section-label">快捷键（无需输入命令）</p>
  <div class="cheat">
    <div class="cheat-row"><span class="cheat-cmd">Option+T / Alt+T</span><span class="cheat-note">开启 Extended Thinking（深度思考模式）</span></div>
    <div class="cheat-row"><span class="cheat-cmd">Option+P / Alt+P</span><span class="cheat-note">打开模型选择器</span></div>
    <div class="cheat-row"><span class="cheat-cmd">Ctrl+G</span><span class="cheat-note">在外部编辑器中打开当前输入</span></div>
    <div class="cheat-row"><span class="cheat-cmd">Shift+Tab</span><span class="cheat-note">切换权限模式（自动/手动确认）</span></div>
    <div class="cheat-row"><span class="cheat-cmd">Ctrl+C</span><span class="cheat-note">中断当前任务</span></div>
    <div class="cheat-row"><span class="cheat-cmd">Shift+Enter</span><span class="cheat-note">多行输入（需要 /terminal-setup 配置）</span></div>
  </div>
</div>

<div id="custom" class="section">
  <div style="background:#E1F5EE;border:0.5px solid #5DCAA5;border-radius:var(--border-radius-lg);padding:14px;margin-bottom:1.5rem">
    <h3 style="color:#085041;margin-bottom:6px">自定义斜杠命令原理</h3>
    <p style="font-size:13px;color:#0F6E56;line-height:1.6">在 <code>.claude/commands/</code> 目录下创建 <code>.md</code> 文件，文件名即命令名。支持 <code>$ARGUMENTS</code> 占位符接收参数，支持 YAML 前置元数据配置权限和描述。</p>
  </div>
  <div class="config-block">
    <h4>📁 目录结构</h4>
    <pre class="code-block"><span class="cmt2"># 项目级命令（git 共享，团队可用）</span>
.claude/commands/
  ├── review.md       <span class="cmt2"># → /review</span>
  ├── test.md         <span class="cmt2"># → /test</span>
  └── deploy.md       <span class="cmt2"># → /deploy</span>

<span class="cmt2"># 个人级命令（跨所有项目可用）</span>
~/.claude/commands/
  └── my-helper.md    <span class="cmt2"># → /my-helper</span></pre>
  </div>
  <div class="cmd-grid">
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">示例：/review</span></div>
      <div class="cmd-desc">代码审查命令（含权限配置）</div>
      <div class="cmd-detail">
        <div class="example"><span class="cmt"># .claude/commands/review.md</span>
---
<span class="kv">allowed-tools</span><span class="punct">:</span> <span class="val">Read, Grep, Glob, Bash(git diff *)</span>
<span class="kv">description</span><span class="punct">:</span> <span class="val">全面代码审查</span>
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

请按优先级给出具体、可操作的建议。</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">示例：/test</span></div>
      <div class="cmd-desc">带参数的测试命令</div>
      <div class="cmd-detail">
        <div class="example"><span class="cmt"># .claude/commands/test.md</span>
---
<span class="kv">allowed-tools</span><span class="punct">:</span> <span class="val">Bash, Read, Edit</span>
<span class="kw">argument-hint</span><span class="punct">:</span> <span class="val">[test-pattern]</span>
<span class="kw">description</span><span class="punct">:</span> <span class="val">运行并修复测试</span>
---

运行匹配以下模式的测试：$ARGUMENTS

1. 检测测试框架（Jest/pytest 等）
2. 运行测试
3. 如果失败，分析并修复
4. 重新运行确认通过</div>
        <div class="tip">使用方式：<br><code>/test auth</code> → $ARGUMENTS = "auth"<br><code>/test user login</code> → $ARGUMENTS = "user login"</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">示例：/commit</span></div>
      <div class="cmd-desc">一键智能提交</div>
      <div class="cmd-detail">
        <div class="example"><span class="cmt"># .claude/commands/commit.md</span>
---
<span class="kv">allowed-tools</span><span class="punct">:</span> <span class="val">Bash(git add:*), Bash(git status:*),</span>
               <span class="val">Bash(git commit:*)</span>
<span class="kw">argument-hint</span><span class="punct">:</span> <span class="val">[commit message]</span>
<span class="kw">description</span><span class="punct">:</span> <span class="val">智能 git 提交</span>
---

1. 运行 git status 查看变更
2. 运行 git diff 理解内容
3. 如果提供了 $ARGUMENTS 则用它作为提交信息
   否则根据变更自动生成符合规范的提交信息
4. git add -A 并提交</div>
      </div>
    </div>
    <div class="cmd-card" onclick="toggleCard(this)">
      <div class="cmd-header"><span class="cmd-name">示例：/optimize</span></div>
      <div class="cmd-desc">性能优化命令</div>
      <div class="cmd-detail">
        <div class="example"><span class="cmt"># .claude/commands/optimize.md</span>
---
<span class="kv">description</span><span class="punct">:</span> <span class="val">分析并优化代码性能</span>
---

分析以下目标的性能问题：$ARGUMENTS

请重点关注：
- 时间复杂度
- 内存使用
- 数据库查询效率
- 不必要的重复计算</div>
        <div class="tip">使用：<code>/optimize src/api/users.ts</code></div>
      </div>
    </div>
  </div>
</div>

<div id="scenarios" class="section">
  <p class="section-label">实战工作流示例</p>
  <div class="scenario">
    <h4>🆕 场景一：新项目初始化</h4>
    <div class="flow">
      <div class="flow-step"><div class="step-num">1</div><div class="step-text">进入项目目录，启动 Claude Code：<span class="step-code">claude</span></div></div>
      <div class="flow-step"><div class="step-num">2</div><div class="step-text">初始化项目配置：<span class="step-code">/init</span>（生成 CLAUDE.md）</div></div>
      <div class="flow-step"><div class="step-num">3</div><div class="step-text">检查安装是否正常：<span class="step-code">/doctor</span></div></div>
      <div class="flow-step"><div class="step-num">4</div><div class="step-text">手动编辑 CLAUDE.md，补充团队规范和常用命令</div></div>
      <div class="flow-step"><div class="step-num">5</div><div class="step-text">命名会话方便后续恢复：<span class="step-code">/rename 项目初始化</span></div></div>
    </div>
  </div>
  <div class="scenario">
    <h4>🔍 场景二：日常 Code Review 工作流</h4>
    <div class="flow">
      <div class="flow-step"><div class="step-num">1</div><div class="step-text">提交前先看 diff：<span class="step-code">/diff</span></div></div>
      <div class="flow-step"><div class="step-num">2</div><div class="step-text">全面代码审查：<span class="step-code">/review</span></div></div>
      <div class="flow-step"><div class="step-num">3</div><div class="step-text">安全专项检查：<span class="step-code">/security-review</span></div></div>
      <div class="flow-step"><div class="step-num">4</div><div class="step-text">加载 PR 评论并修复：<span class="step-code">/pr-comments 42</span>，然后说"帮我解决所有评论问题"</div></div>
      <div class="flow-step"><div class="step-num">5</div><div class="step-text">智能提交：<span class="step-code">/commit</span>（如果有自定义命令）</div></div>
    </div>
  </div>
  <div class="scenario">
    <h4>🔄 场景三：大规模重构</h4>
    <div class="flow">
      <div class="flow-step"><div class="step-num">1</div><div class="step-text">先规划再动手：<span class="step-code">/plan 将 API 从 REST 迁移到 GraphQL</span></div></div>
      <div class="flow-step"><div class="step-num">2</div><div class="step-text">确认计划后并行执行：<span class="step-code">/batch "迁移所有 REST 端点到 GraphQL"</span></div></div>
      <div class="flow-step"><div class="step-num">3</div><div class="step-text">如果出错，回退到安全节点：<span class="step-code">/rewind</span></div></div>
      <div class="flow-step"><div class="step-num">4</div><div class="step-text">想同时探索另一方案：<span class="step-code">/fork 方案B</span></div></div>
    </div>
  </div>
  <div class="scenario">
    <h4>💰 场景四：长任务 token 管理</h4>
    <div class="flow">
      <div class="flow-step"><div class="step-num">1</div><div class="step-text">定期检查用量：<span class="step-code">/cost</span> 和 <span class="step-code">/context</span></div></div>
      <div class="flow-step"><div class="step-num">2</div><div class="step-text">快满时压缩上下文：<span class="step-code">/compact 保留关于数据库设计的讨论</span></div></div>
      <div class="flow-step"><div class="step-num">3</div><div class="step-text">换任务时彻底清空：<span class="step-code">/clear</span></div></div>
      <div class="flow-step"><div class="step-num">4</div><div class="step-text">导出重要对话留存：<span class="step-code">/export session-notes.txt</span></div></div>
    </div>
  </div>
  <div class="scenario">
    <h4>🏗️ 场景五：配置 CLAUDE.md 最佳实践</h4>
    <div style="margin-top:8px">
    <pre class="code-block"><span class="cmt2"># CLAUDE.md 示例</span>

<span class="kv">## 项目概述</span>
Next.js 15 + TypeScript + Prisma 的 SaaS 项目

<span class="kv">## 常用命令</span>
- 构建: `npm run build`
- 测试: `npm test -- --watch`
- 代码检查: `npm run lint --fix`
- 数据库迁移: `npx prisma migrate dev`

<span class="kv">## 代码规范</span>
- TypeScript strict 模式，禁止 any
- 禁止 default export
- 提交格式: feat/fix/chore(scope): description
- 组件用 .tsx，工具函数用 .ts

<span class="kv">## 注意事项</span>
- 不要修改 /src/lib/auth.ts（由安全团队维护）
- 数据库操作必须用事务
- API 路由必须验证 zod schema</pre>
    </div>
  </div>
</div>

<div id="cheatsheet" class="section">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div>
      <p class="section-label">📋 会话控制</p>
      <div class="cheat">
        <div class="cheat-row"><span class="cheat-cmd">/init</span><span class="cheat-note">初始化项目 CLAUDE.md</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/clear</span><span class="cheat-note">清空对话（reset/new）</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/compact [说明]</span><span class="cheat-note">压缩上下文节省 token</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/fork [名称]</span><span class="cheat-note">分叉出新会话</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/resume [ID/名]</span><span class="cheat-note">恢复历史会话</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/rename [名称]</span><span class="cheat-note">给会话命名</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/rewind</span><span class="cheat-note">回退到历史节点</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/plan [描述]</span><span class="cheat-note">先规划再执行</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/export [文件名]</span><span class="cheat-note">导出对话记录</span></div>
      </div>
      <p class="section-label" style="margin-top:12px">🔍 监控 & 诊断</p>
      <div class="cheat">
        <div class="cheat-row"><span class="cheat-cmd">/cost</span><span class="cheat-note">token 用量和花费</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/context</span><span class="cheat-note">可视化上下文用量</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/usage</span><span class="cheat-note">计划配额用量</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/stats</span><span class="cheat-note">使用统计图表</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/doctor</span><span class="cheat-note">诊断安装问题</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/insights</span><span class="cheat-note">使用模式分析</span></div>
      </div>
      <p class="section-label" style="margin-top:12px">⌨️ 快捷键</p>
      <div class="cheat">
        <div class="cheat-row"><span class="cheat-cmd">Option/Alt+T</span><span class="cheat-note">开启深度思考模式</span></div>
        <div class="cheat-row"><span class="cheat-cmd">Option/Alt+P</span><span class="cheat-note">模型选择器</span></div>
        <div class="cheat-row"><span class="cheat-cmd">Ctrl+G</span><span class="cheat-note">外部编辑器</span></div>
        <div class="cheat-row"><span class="cheat-cmd">Shift+Tab</span><span class="cheat-note">切换权限模式</span></div>
      </div>
    </div>
    <div>
      <p class="section-label">🔧 代码 & 项目</p>
      <div class="cheat">
        <div class="cheat-row"><span class="cheat-cmd">/review</span><span class="cheat-note">代码审查</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/security-review</span><span class="cheat-note">安全漏洞扫描</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/diff</span><span class="cheat-note">交互式 diff 查看</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/pr-comments [PR]</span><span class="cheat-note">加载 PR 评论</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/memory</span><span class="cheat-note">编辑 CLAUDE.md</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/hooks</span><span class="cheat-note">查看自动化钩子</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/permissions</span><span class="cheat-note">工具权限管理</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/add-dir [路径]</span><span class="cheat-note">添加工作目录</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/mcp</span><span class="cheat-note">管理 MCP 服务器</span></div>
      </div>
      <p class="section-label" style="margin-top:12px">🚀 捆绑技能</p>
      <div class="cheat">
        <div class="cheat-row"><span class="cheat-cmd">/batch [指令]</span><span class="cheat-note">并行大规模修改</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/debug [描述]</span><span class="cheat-note">系统性调试</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/simplify</span><span class="cheat-note">简化重构代码</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/claude-api</span><span class="cheat-note">加载 API 文档</span></div>
      </div>
      <p class="section-label" style="margin-top:12px">🎨 界面 & 体验</p>
      <div class="cheat">
        <div class="cheat-row"><span class="cheat-cmd">/model [模型]</span><span class="cheat-note">切换 AI 模型</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/effort [级别]</span><span class="cheat-note">思考深度 low-max</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/color [颜色]</span><span class="cheat-note">提示栏颜色</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/theme</span><span class="cheat-note">切换 light/dark</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/voice</span><span class="cheat-note">语音输入模式</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/vim</span><span class="cheat-note">Vim 键位模式</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/copy</span><span class="cheat-note">复制上条回复</span></div>
        <div class="cheat-row"><span class="cheat-cmd">/btw [问题]</span><span class="cheat-note">任务进行中插话</span></div>
      </div>
    </div>
  </div>
  <div style="margin-top:14px;background:#FAECE7;border:0.5px solid #F09975;border-radius:var(--border-radius-lg);padding:12px">
    <h3 style="color:#712B13;margin-bottom:6px;font-size:13px">🏆 高效使用的黄金法则</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#993C1D;line-height:1.6">
      <div>1. 新项目必先 <code>/init</code>，然后手动完善 CLAUDE.md</div>
      <div>2. 长任务定期 <code>/compact</code>，不要等满了再清</div>
      <div>3. 大改动前先 <code>/plan</code>，确认思路再执行</div>
      <div>4. 提交前跑 <code>/review</code> + <code>/security-review</code></div>
      <div>5. 多终端开着时用 <code>/color</code> 区分环境</div>
      <div>6. 用自定义命令沉淀团队最佳实践</div>
    </div>
  </div>
</div>

<script>
function switchTab(id){
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}
function toggleCard(el){
  el.classList.toggle('expanded');
}
</script>
