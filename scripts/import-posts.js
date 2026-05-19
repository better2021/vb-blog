// Purpose: One-time script to import existing content/posts/*.md files into Vercel KV.
// Usage: node scripts/import-posts.js
// (Set KV_URL/KV_REST_API_URL to import into Vercel KV, or run as-is for local dev)
const fs = require("node:fs/promises");
const path = require("node:path");
const { kv } = require("../src/kv");
const { parseMarkdownPost } = require("../src/blogService");

const POSTS_DIR = path.join(__dirname, "..", "content", "posts");
const KV_KEY = "blog:posts";

async function importPosts() {
  let files;
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch (error) {
    throw new Error(`无法读取 ${POSTS_DIR}：${error.message}`);
  }

  const mdFiles = files.filter((f) => f.endsWith(".md"));

  if (mdFiles.length === 0) {
    console.log("content/posts/ 中没有 Markdown 文件。");
    return;
  }

  const posts = [];

  for (const file of mdFiles.sort()) {
    const filePath = path.join(POSTS_DIR, file);
    const content = await fs.readFile(filePath, "utf8");
    const slug = path.basename(file, ".md");

    try {
      const post = parseMarkdownPost(content, slug);
      posts.push(post);
      console.log(`  ✓ ${slug}`);
    } catch (error) {
      console.error(`  ✗ ${slug}：${error.message}`);
    }
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  await kv.set(KV_KEY, posts);

  console.log(`\n已导入 ${posts.length} 篇文章到 KV。`);
}

importPosts().catch((error) => {
  console.error("导入失败：", error.message);
  process.exit(1);
});
