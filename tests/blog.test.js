// Purpose: Route and content-management coverage for the server-rendered Markdown blog module.
const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");
const { kv, _resetStore } = require("../src/kv");
const { parseMarkdownPost } = require("../src/blogService");

process.env.SITE_URL = "https://example.test";

const app = require("../server");

const FIRST_POST = [
  "---",
  "title: Building Readable Node.js Services",
  "date: 2026-05-02",
  "category: Node.js",
  "tags:",
  "  - Express",
  "  - Markdown",
  "excerpt: Keep services readable.",
  "---",
  "",
  "# Building Readable Node.js Services",
  "",
  "Searchable body text about async routes.",
  "",
  "```js",
  "const framework = \"Express\";",
  "```",
  ""
].join("\n");

const SECOND_POST = [
  "---",
  "title: Clean Blog Layout Principles",
  "date: 2026-04-12",
  "category: Design",
  "tags:",
  "  - Responsive",
  "  - Typography",
  "excerpt: Design for reading.",
  "---",
  "",
  "# Clean Blog Layout Principles",
  "",
  "A clean layout gives readers a predictable rhythm.",
  ""
].join("\n");

test.beforeEach(async () => {
  _resetStore();
  const firstPost = parseMarkdownPost(FIRST_POST, "building-readable-node-services");
  const secondPost = parseMarkdownPost(SECOND_POST, "clean-blog-layout-principles");
  const seedPosts = [firstPost, secondPost].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  await kv.set("blog:posts", seedPosts);
});

test.after(() => {
  _resetStore();
});

test("test_homepage_returns_markdown_article_list", async () => {
  const response = await request(app).get("/").expect(200);

  assert.match(response.text, /技术文章与个人笔记/);
  assert.match(response.text, /Building Readable Node\.js Services/);
});

test("test_post_detail_renders_markdown_html", async () => {
  const response = await request(app).get("/posts/building-readable-node-services").expect(200);

  assert.match(response.text, /<h1>Building Readable Node\.js Services<\/h1>/);
  assert.match(response.text, /<p>Searchable body text about async routes\.<\/p>/);
});

test("test_post_detail_renders_highlighted_code_block", async () => {
  const response = await request(app).get("/posts/building-readable-node-services").expect(200);

  assert.match(response.text, /class="language-js"/);
  assert.match(response.text, /hljs/);
});

test("test_homepage_supports_search_results_from_markdown_body", async () => {
  const response = await request(app).get("/?q=async%20routes").expect(200);

  assert.match(response.text, /Building Readable Node\.js Services/);
  assert.doesNotMatch(response.text, /Clean Blog Layout Principles/);
});

test("test_homepage_handles_empty_search_results", async () => {
  const response = await request(app).get("/?q=not-a-real-post").expect(200);

  assert.match(response.text, /没有找到相关文章/);
});

test("test_post_detail_returns_404_for_unknown_slug", async () => {
  const response = await request(app).get("/posts/unknown-post").expect(404);

  assert.match(response.text, /页面未找到/);
});

test("test_category_page_filters_articles", async () => {
  const response = await request(app).get("/categories/Node.js").expect(200);

  assert.match(response.text, /Building Readable Node\.js Services/);
  assert.doesNotMatch(response.text, /Clean Blog Layout Principles/);
});

test("test_tag_page_filters_articles", async () => {
  const response = await request(app).get("/tags/Responsive").expect(200);

  assert.match(response.text, /Clean Blog Layout Principles/);
  assert.doesNotMatch(response.text, /Building Readable Node\.js Services/);
});

test("test_about_page_returns_success", async () => {
  const response = await request(app).get("/about").expect(200);

  assert.match(response.text, /关于这个博客/);
});

test("test_admin_homepage_returns_article_list", async () => {
  const response = await request(app).get("/admin").expect(200);

  assert.match(response.text, /Markdown 文章/);
  assert.match(response.text, /Building Readable Node\.js Services/);
});

test("test_admin_create_post_writes_markdown_file", async () => {
  await request(app)
    .post("/admin/posts")
    .type("form")
    .send({
      slug: "new-markdown-post",
      title: "New Markdown Post",
      date: "2026-05-11",
      category: "Writing",
      tags: "Markdown, Admin",
      excerpt: "Created from the admin editor.",
      content: "# New Markdown Post\n\nCreated body."
    })
    .expect(302);

  const posts = await kv.get("blog:posts");
  const created = posts.find((p) => p.slug === "new-markdown-post");
  assert.ok(created);
  assert.equal(created.title, "New Markdown Post");
});

test("test_admin_edit_post_updates_markdown_file", async () => {
  await request(app)
    .post("/admin/posts/building-readable-node-services")
    .type("form")
    .send({
      title: "Updated Node Service Notes",
      date: "2026-05-03",
      category: "Node.js",
      tags: "Express, Updated",
      excerpt: "Updated excerpt.",
      content: "# Updated Node Service Notes\n\nUpdated body."
    })
    .expect(302);

  const posts = await kv.get("blog:posts");
  const updated = posts.find((p) => p.slug === "building-readable-node-services");
  assert.ok(updated);
  assert.equal(updated.title, "Updated Node Service Notes");
  assert.match(updated.content, /Updated body/);
});

test("test_admin_list_contains_delete_confirmation", async () => {
  const response = await request(app).get("/admin").expect(200);

  assert.match(response.text, /delete-post-form/);
  assert.match(response.text, /data-post-title="Building Readable Node\.js Services"/);
});

test("test_admin_delete_post_removes_markdown_file", async () => {
  await request(app)
    .post("/admin/posts/building-readable-node-services/delete")
    .expect(302);

  const posts = await kv.get("blog:posts");
  assert.equal(posts.find((p) => p.slug === "building-readable-node-services"), undefined);
  await request(app).get("/posts/building-readable-node-services").expect(404);
});

test("test_upload_rejects_non_markdown_file", async () => {
  const response = await request(app)
    .post("/admin/upload")
    .attach("markdown", Buffer.from("plain text"), "notes.txt")
    .expect(400);

  assert.match(response.text, /Only \.md files can be uploaded/);
});

test("test_upload_rejects_conflicting_markdown_file", async () => {
  const response = await request(app)
    .post("/admin/upload")
    .attach("markdown", Buffer.from(FIRST_POST), "building-readable-node-services.md")
    .expect(400);

  assert.match(response.text, /already exists/);
});

test("test_rss_returns_xml_with_full_content", async () => {
  const response = await request(app).get("/rss.xml").expect(200);

  assert.equal(response.type, "application/rss+xml");
  assert.match(response.text, /<rss version="2\.0"/);
  assert.match(response.text, /https:\/\/example\.test\/posts\/building-readable-node-services/);
  assert.match(response.text, /<content:encoded><!\[CDATA\[/);
  assert.match(response.text, /Searchable body text about async routes/);
});
