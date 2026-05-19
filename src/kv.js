// Purpose: KV storage abstraction.
// - When GITHUB_TOKEN and GITHUB_REPO are set: reads/writes posts as .md files
//   in the GitHub repo via API. Every write creates a git commit.
// - Falls back to a local JSON file when GitHub API is unreachable (local dev).
const path = require("node:path");
const fs = require("node:fs");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const POSTS_DIR = "content/posts";
const KV_POSTS_KEY = "blog:posts";

// ── Local JSON-file backend (always available as fallback / cache) ────────────

const DB_PATH = path.join(__dirname, "..", "data", "kv.json");
const localStore = new Map();

function loadLocalStore() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(raw);
    for (const [key, value] of Object.entries(data)) {
      localStore.set(key, value);
    }
  } catch {
    // File doesn't exist yet — start empty
  }
}

function saveLocalStore() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = Object.fromEntries(localStore.entries());
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("KV: failed to persist to disk:", error.message);
  }
}

loadLocalStore();

// ── GitHub API backend ──────────────────────────────────────────────────────

const shaCache = new Map();

function githubUrl(apiPath) {
  return `https://api.github.com/repos/${GITHUB_REPO}/contents/${apiPath}`;
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "vb-blog"
  };
}

async function githubRequest(method, apiPath, body) {
  const options = { method, headers: githubHeaders() };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(githubUrl(apiPath), options);
  if (res.status === 404) return null;
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${err}`);
  }
  return res.json();
}

async function listPostFiles() {
  const data = await githubRequest("GET", POSTS_DIR);
  if (!data) return [];
  return Array.isArray(data) ? data.filter((f) => f.name.endsWith(".md")) : [];
}

async function downloadFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  return res.text();
}

// Lazy-require to break circular dependency (blogService → kv → blogService)
function parsePost(raw, slug) {
  try {
    return require("./blogService").parseMarkdownPost(raw, slug);
  } catch {
    // If markdown parsing fails (e.g. HTML file with .md extension), try HTML fallback
    return require("./blogService").parseHtmlPost(raw, slug);
  }
}

// ── Client selection ────────────────────────────────────────────────────────

const useGitHub = Boolean(GITHUB_TOKEN && GITHUB_REPO);
let client;

if (useGitHub) {
  // ── GitHub API backend with local cache fallback ────────────────────────
  client = {
    async get(key) {
      if (key !== KV_POSTS_KEY) return null;

      // Try GitHub API first; fall back to local cache on failure
      try {
        const files = await listPostFiles();
        if (files.length === 0) return [];

        const posts = [];
        for (const file of files) {
          const slug = path.basename(file.name, ".md");
          const content = await downloadFile(file.download_url);
          shaCache.set(slug, file.sha);
          posts.push(parsePost(content, slug));
        }

        const sorted = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Cache locally for offline fallback
        localStore.set(key, sorted);
        saveLocalStore();
        return sorted;
      } catch (error) {
        console.error("KV: GitHub API unavailable, using local cache:", error.message);
        return localStore.get(key) ?? [];
      }
    },

    async set(key, value) {
      if (key !== KV_POSTS_KEY) return;

      // Always update local cache
      localStore.set(key, value);
      saveLocalStore();

      // Try to sync to GitHub; swallow errors so local dev still works
      try {
        const existingFiles = await listPostFiles();
        const existingBySlug = new Map(
          existingFiles.map((f) => [path.basename(f.name, ".md"), f])
        );

        const newSlugs = new Set(value.map((p) => p.slug));

        for (const post of value) {
          const existing = existingBySlug.get(post.slug) || shaCache.get(post.slug);
          const sha = existing ? (typeof existing === "string" ? existing : existing.sha) : undefined;
          const filePath = `${POSTS_DIR}/${post.slug}.md`;

          const body = {
            message: `blog: update ${post.slug}`,
            content: Buffer.from(post.raw, "utf8").toString("base64")
          };
          if (sha) body.sha = sha;

          const res = await githubRequest("PUT", filePath, body);
          if (res && res.content) {
            shaCache.set(post.slug, res.content.sha);
          }
        }

        for (const [slug, file] of existingBySlug) {
          if (!newSlugs.has(slug)) {
            await githubRequest("DELETE", `${POSTS_DIR}/${file.name}`, {
              message: `blog: delete ${slug}`,
              sha: file.sha
            });
            shaCache.delete(slug);
          }
        }
      } catch (error) {
        console.error("KV: failed to sync to GitHub (changes saved locally):", error.message);
      }
    },

    async del(key) {
      // Used by tests only — not applicable via GitHub API
    }
  };
} else {
  // ── Local-only backend (no GitHub configured) ───────────────────────────
  client = {
    get: (key) => Promise.resolve(localStore.get(key) ?? null),
    set: (key, value) => {
      localStore.set(key, value);
      saveLocalStore();
      return Promise.resolve();
    },
    del: (key) => {
      localStore.delete(key);
      saveLocalStore();
      return Promise.resolve();
    }
  };
}

function resetStore() {
  localStore.clear();
  saveLocalStore();
  shaCache.clear();
}

module.exports = { kv: client, _resetStore: resetStore };
