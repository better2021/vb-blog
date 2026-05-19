# Node.js + Express + EJS Markdown Blog

This is a server-rendered blog scaffold built with Node.js, Express, EJS, and local Markdown files. It includes a simple admin editor, Markdown upload, permanent delete with browser confirmation, RSS, and server-side code highlighting.

## Features

- Server-rendered homepage with pagination, search, and card/list views
- One Markdown file per post in `content/posts/`
- Front Matter metadata for title, date, category, tags, and excerpt
- Post detail pages with rendered Markdown HTML
- Category archive and tag filtering
- Simple admin editor at `/admin`
- Markdown upload at `/admin/upload`
- Permanent delete with a second browser confirmation
- Full-content RSS feed at `/rss.xml`
- Static assets served from `public/`

## Project Structure

```text
blog/
├── .gitignore
├── content/
│   └── posts/
│       └── building-readable-node-services.md
├── public/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── main.js
├── src/
│   └── blogService.js
├── tests/
│   └── blog.test.js
├── views/
│   ├── admin/
│   ├── partials/
│   ├── about.ejs
│   ├── categories.ejs
│   ├── collection.ejs
│   ├── error.ejs
│   ├── home.ejs
│   └── post.ejs
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Install and Run

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Development mode:

```bash
npm run dev
```

Tests:

```bash
npm test
```

## Writing Posts

Create a new `.md` file in `content/posts/`. The file name becomes the URL slug.

Example:

````markdown
---
title: Building Readable Node.js Services
date: 2026-05-02
category: Node.js
tags:
  - Express
  - Markdown
excerpt: Keep the entrypoint small and make errors predictable.
---

# Building Readable Node.js Services

Write the article body in Markdown.

```js
console.info("Code blocks are highlighted");
```
````

The example above becomes:

```text
/posts/building-readable-node-services
```

Raw HTML inside Markdown is disabled by the renderer.

## Admin

Open:

```text
http://localhost:3000/admin
```

The admin area can:

- Create Markdown posts
- Edit existing Markdown posts
- Upload one `.md` file up to 1 MB
- Delete a post after a browser confirmation dialog

The admin area has no login protection by design. Do not expose it publicly without adding access control through a reverse proxy, VPN, or application authentication.

## RSS

RSS is available at:

```text
http://localhost:3000/rss.xml
```

Set `SITE_URL` in production so RSS links use the public domain:

```bash
SITE_URL=https://example.com npm start
```

## Deployment

Use Node.js 20 or newer.

```bash
npm ci --omit=dev
PORT=3000 SITE_URL=https://example.com npm start
```

Common platforms:

- Render, Railway, Fly.io: build with `npm ci`, start with `npm start`
- VPS: install Node.js, run `npm ci --omit=dev`, then manage `npm start` with a process manager
- Docker or platform images: expose `PORT` and set `SITE_URL`

