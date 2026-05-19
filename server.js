// Purpose: Express application entrypoint for the server-rendered Markdown blog module.
require("dotenv").config();
const path = require("node:path");
const express = require("express");
const multer = require("multer");
const {
  POSTS_PER_PAGE,
  buildArchive,
  createPost,
  deletePost,
  filterPostsByCategory,
  filterPostsBySearch,
  filterPostsByTag,
  getPostBySlug,
  getPosts,
  paginatePosts,
  sanitizePageNumber,
  sanitizeSearchQuery,
  sanitizeSlug,
  sanitizeViewMode,
  saveUploadedMarkdownFile,
  updatePost
} = require("./src/blogService");

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const MAX_FORM_BODY_SIZE = "1mb";
const MAX_UPLOAD_FILE_SIZE = 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_FILE_SIZE,
    files: 1
  }
});
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false, limit: MAX_FORM_BODY_SIZE }));
app.use(express.static(path.join(__dirname, "public")));

/**
 * Wraps async route handlers so route failures reach the shared error page.
 *
 * @param {Function} handler Express async route handler.
 * @returns {Function} Express route middleware.
 */
function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

/**
 * Builds shared template data used by all pages.
 *
 * @param {Array<object>} posts All known blog posts.
 * @param {object} request Express request object.
 * @returns {object} Navigation and archive data.
 */
function createBaseViewModel(posts, request) {
  const archive = buildArchive(posts);

  return {
    currentPath: request.path,
    categories: archive.categories,
    tags: archive.tags
  };
}

/**
 * Builds default form data for the admin editor.
 *
 * @returns {object} Empty post form values.
 */
function createEmptyPostForm() {
  return {
    slug: "",
    title: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    tags: "",
    excerpt: "",
    content: ""
  };
}

/**
 * Converts a parsed post into editor form values.
 *
 * @param {object} post Blog post.
 * @returns {object} Form values.
 */
function createPostFormFromPost(post) {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    tags: post.tags.join(", "),
    excerpt: post.excerpt,
    content: post.content
  };
}

app.get("/", asyncRoute(async (request, response) => {
  const posts = await getPosts();
  const searchQuery = sanitizeSearchQuery(request.query.q);
  const viewMode = sanitizeViewMode(request.query.view);
  const page = sanitizePageNumber(request.query.page);
  const filteredPosts = filterPostsBySearch(posts, searchQuery);
  const pagination = paginatePosts(filteredPosts, page, POSTS_PER_PAGE);

  response.render("home", {
    ...createBaseViewModel(posts, request),
    title: "首页",
    description: "技术文章与个人笔记",
    posts: pagination.posts,
    pagination,
    searchQuery,
    viewMode
  });
}));

app.get("/posts/:slug", asyncRoute(async (request, response, next) => {
  const posts = await getPosts();
  const post = getPostBySlug(posts, request.params.slug);

  if (!post) {
    next();
    return;
  }

  response.render("post", {
    ...createBaseViewModel(posts, request),
    title: post.title,
    description: post.excerpt,
    post
  });
}));

app.get("/categories", asyncRoute(async (request, response) => {
  const posts = await getPosts();

  response.render("categories", {
    ...createBaseViewModel(posts, request),
    title: "分类",
    description: "按分类浏览技术文章"
  });
}));

app.get("/categories/:category", asyncRoute(async (request, response) => {
  const posts = await getPosts();
  const viewMode = sanitizeViewMode(request.query.view);
  const category = request.params.category;
  const filteredPosts = filterPostsByCategory(posts, category);

  response.render("collection", {
    ...createBaseViewModel(posts, request),
    title: `${category} 分类`,
    description: `浏览 ${category} 分类下的文章`,
    collectionTitle: category,
    collectionType: "分类",
    posts: filteredPosts,
    viewMode
  });
}));

app.get("/tags/:tag", asyncRoute(async (request, response) => {
  const posts = await getPosts();
  const viewMode = sanitizeViewMode(request.query.view);
  const tag = request.params.tag;
  const filteredPosts = filterPostsByTag(posts, tag);

  response.render("collection", {
    ...createBaseViewModel(posts, request),
    title: `${tag} 标签`,
    description: `浏览带有 ${tag} 标签的文章`,
    collectionTitle: tag,
    collectionType: "标签",
    posts: filteredPosts,
    viewMode
  });
}));

app.get("/about", asyncRoute(async (request, response) => {
  const posts = await getPosts();

  response.render("about", {
    ...createBaseViewModel(posts, request),
    title: "关于",
    description: "关于这个技术博客"
  });
}));

app.get("/rss.xml", asyncRoute(async (request, response) => {
  const posts = await getPosts();

  response
    .type("application/rss+xml")
    .send(buildRssFeed(posts));
}));

app.get("/admin", asyncRoute(async (request, response) => {
  const posts = await getPosts();

  response.render("admin/index", {
    title: "后台",
    description: "管理 Markdown 文章",
    currentPath: request.path,
    posts,
    message: request.query.message || "",
    error: request.query.error || ""
  });
}));

app.get("/admin/posts/new", (request, response) => {
  response.render("admin/edit", {
    title: "新建文章",
    description: "创建 Markdown 文章",
    currentPath: request.path,
    formTitle: "新建文章",
    action: "/admin/posts",
    submitLabel: "创建文章",
    isEditing: false,
    error: "",
    post: createEmptyPostForm()
  });
});

app.post("/admin/posts", asyncRoute(async (request, response) => {
  try {
    const post = await createPost({
      ...request.body,
      slug: sanitizeSlug(request.body.slug)
    });
    response.redirect(`/admin?message=${encodeURIComponent(`已创建《${post.title}》。`)}`);
  } catch (error) {
    response.status(400).render("admin/edit", {
      title: "新建文章",
      description: "创建 Markdown 文章",
      currentPath: request.path,
      formTitle: "新建文章",
      action: "/admin/posts",
      submitLabel: "创建文章",
      isEditing: false,
      error: error.message,
      post: {
        ...createEmptyPostForm(),
        ...request.body,
        slug: sanitizeSlug(request.body.slug)
      }
    });
  }
}));

app.get("/admin/posts/:slug/edit", asyncRoute(async (request, response, next) => {
  const posts = await getPosts();
  const post = getPostBySlug(posts, request.params.slug);

  if (!post) {
    next();
    return;
  }

  response.render("admin/edit", {
    title: "编辑文章",
    description: "编辑 Markdown 文章",
    currentPath: request.path,
    formTitle: `编辑《${post.title}》`,
    action: `/admin/posts/${post.slug}`,
    submitLabel: "保存修改",
    isEditing: true,
    error: "",
    post: createPostFormFromPost(post)
  });
}));

app.post("/admin/posts/:slug", asyncRoute(async (request, response) => {
  try {
    const post = await updatePost(request.params.slug, request.body);
    response.redirect(`/admin?message=${encodeURIComponent(`已更新《${post.title}》。`)}`);
  } catch (error) {
    response.status(400).render("admin/edit", {
      title: "编辑文章",
      description: "编辑 Markdown 文章",
      currentPath: request.path,
      formTitle: "编辑文章",
      action: `/admin/posts/${request.params.slug}`,
      submitLabel: "保存修改",
      isEditing: true,
      error: error.message,
      post: {
        ...createEmptyPostForm(),
        ...request.body,
        slug: sanitizeSlug(request.params.slug)
      }
    });
  }
}));

app.post("/admin/posts/:slug/delete", asyncRoute(async (request, response) => {
  try {
    await deletePost(request.params.slug);
    response.redirect(`/admin?message=${encodeURIComponent("文章已删除。")}`);
  } catch (error) {
    response.redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }
}));

app.get("/admin/upload", (request, response) => {
  response.render("admin/upload", {
    title: "上传文件",
    description: "上传一篇 Markdown 或 HTML 文章",
    currentPath: request.path,
    error: "",
    message: "",
    slugValue: "",
    titleValue: "",
    dateValue: new Date().toISOString().slice(0, 10),
    categoryValue: "",
    tagsValue: "",
    excerptValue: ""
  });
});

app.post("/admin/upload", upload.single("markdown"), asyncRoute(async (request, response) => {
  try {
    const post = await saveUploadedMarkdownFile(request.file, request.body);
    response.redirect(`/admin?message=${encodeURIComponent(`已上传《${post.title}》。`)}`);
  } catch (error) {
    response.status(400).render("admin/upload", {
      title: "上传文件",
      description: "上传一篇 Markdown 或 HTML 文章",
      currentPath: request.path,
      error: error.message,
      message: "",
      slugValue: request.body.slug || "",
      titleValue: request.body.title || "",
      dateValue: request.body.date || new Date().toISOString().slice(0, 10),
      categoryValue: request.body.category || "",
      tagsValue: request.body.tags || "",
      excerptValue: request.body.excerpt || ""
    });
  }
}));

app.use((request, response) => {
  response.status(404).render("error", {
    currentPath: request.path,
    categories: [],
    tags: [],
    title: "页面未找到",
    description: "请求的页面不存在",
    statusCode: 404,
    message: "页面未找到"
  });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  response.status(500).render("error", {
    currentPath: request.path,
    categories: [],
    tags: [],
    title: "服务暂时不可用",
    description: "服务端无法处理请求",
    statusCode: 500,
    message: "服务暂时不可用"
  });
});

/**
 * Builds a full-content RSS feed.
 *
 * @param {Array<object>} posts Blog posts.
 * @returns {string} RSS XML.
 */
function buildRssFeed(posts) {
  const items = posts.map((post) => {
    const postUrl = `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`;

    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(postUrl)}</link>`,
      `      <guid>${escapeXml(postUrl)}</guid>`,
      `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
      `      <category>${escapeXml(post.category)}</category>`,
      post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n"),
      `      <description>${escapeXml(post.excerpt)}</description>`,
      `      <content:encoded><![CDATA[${post.html}]]></content:encoded>`,
      "    </item>"
    ].filter(Boolean).join("\n");
  }).join("\n");

  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<rss version=\"2.0\" xmlns:content=\"http://purl.org/rss/1.0/modules/content/\">",
    "  <channel>",
    "    <title>清简技术博客</title>",
    `    <link>${escapeXml(SITE_URL)}</link>`,
    "    <description>技术文章与个人笔记</description>",
    "    <language>zh-cn</language>",
    items,
    "  </channel>",
    "</rss>"
  ].join("\n");
}

/**
 * Escapes XML text nodes and attributes.
 *
 * @param {string} value Raw text.
 * @returns {string} Escaped XML text.
 */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

if (require.main === module) {
  const server = app.listen(PORT, () => {
    process.stdout.write(`Blog server is running at http://localhost:${PORT}\n`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      process.stderr.write(`Port ${PORT} is already in use. Stop the existing process or set PORT to another value.\n`);
      process.exitCode = 1;
      return;
    }

    throw error;
  });

  // Graceful shutdown for node --watch: close the port before restart
  process.on("SIGTERM", () => server.close());
  process.on("SIGINT", () => server.close());
}

module.exports = app;
