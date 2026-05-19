// Purpose: KV storage abstraction. Uses @vercel/kv when KV_URL is set,
// otherwise falls back to a JSON-file-backed store for local dev and testing.
// This ensures local data survives process restarts.
const path = require("node:path");
const fs = require("node:fs");

const DB_PATH = path.join(__dirname, "..", "data", "kv.json");
const store = new Map();

// Load existing data on startup
function loadStore() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(raw);
    for (const [key, value] of Object.entries(data)) {
      store.set(key, value);
    }
  } catch {
    // File doesn't exist yet or is corrupt — start with empty store
  }
}

function saveStore() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = Object.fromEntries(store.entries());
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("KV: failed to persist to disk:", error.message);
  }
}

let client;

if (process.env.KV_URL || process.env.KV_REST_API_URL) {
  client = require("@vercel/kv").kv;
} else {
  loadStore();
  client = {
    get: (key) => Promise.resolve(store.get(key) ?? null),
    set: (key, value) => {
      store.set(key, value);
      saveStore();
      return Promise.resolve();
    },
    del: (key) => {
      store.delete(key);
      saveStore();
      return Promise.resolve();
    }
  };
}

module.exports = { kv: client, _resetStore() { store.clear(); saveStore(); } };
