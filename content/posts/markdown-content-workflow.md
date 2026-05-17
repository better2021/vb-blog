---
title: Markdown 内容写作流程
date: 2026-03-29
category: 内容管理
tags:
  - Markdown
  - Front Matter
  - 写作
excerpt: 每篇文章一个 Markdown 文件，让博客写作更简单，也更方便迁移。
---

# Markdown 内容写作流程

Markdown 很适合个人笔记和技术文章。它接近纯文本，同时支持标题、列表、链接、代码块和引用。

Front Matter 用来保存博客需要的元信息：

```yaml
---
title: 我的文章
date: 2026-05-11
category: Node.js
tags:
  - Express
excerpt: 一句话摘要。
---
```

使用文件名作为 slug 能让 URL 更可预期，也方便在本地编辑和版本管理。
