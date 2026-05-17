// Purpose: Route and content-management coverage for the server-rendered Markdown blog module.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const request = require("supertest");

process.env.BLOG_POSTS_DIR = path.join(os.tmpdir(), `blog-posts-${process.pid}`);
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
  await fs.rm(process.env.BLOG_POSTS_DIR, { recursive: true, force: true });
  await fs.mkdir(process.env.BLOG_POSTS_DIR, { recursive: true });
  await fs.writeFile(path.join(process.env.BLOG_POSTS_DIR, "building-readable-node-services.md"), FIRST_POST, "utf8");
  await fs.writeFile(path.join(process.env.BLOG_POSTS_DIR, "clean-blog-layout-principles.md"), SECOND_POST, "utf8");
});

test.after(async () => {
  await fs.rm(process.env.BLOG_POSTS_DIR, { recursive: true, force: true });
});

test("test_homepage_returns_markdown_article_list", async () => {
  const response = await request(app).get("/").expect(200);

  assert.match(response.text, /Technical Articles and Personal Notes/);
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

  assert.match(response.text, /No matching posts/);
});

test("test_post_detail_returns_404_for_unknown_slug", async () => {
  const response = await request(app).get("/posts/unknown-post").expect(404);

  assert.match(response.text, /Page Not Found/);
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

  assert.match(response.text, /About this Blog/);
});

test("test_admin_homepage_returns_article_list", async () => {
  const response = await request(app).get("/admin").expect(200);

  assert.match(response.text, /Markdown Posts/);
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

  const savedPost = await fs.readFile(path.join(process.env.BLOG_POSTS_DIR, "new-markdown-post.md"), "utf8");
  assert.match(savedPost, /title: New Markdown Post/);
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

  const savedPost = await fs.readFile(path.join(process.env.BLOG_POSTS_DIR, "building-readable-node-services.md"), "utf8");
  assert.match(savedPost, /title: Updated Node Service Notes/);
  assert.match(savedPost, /Updated body/);
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

  await assert.rejects(
    fs.access(path.join(process.env.BLOG_POSTS_DIR, "building-readable-node-services.md"))
  );

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
