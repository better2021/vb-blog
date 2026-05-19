// Purpose: Markdown content access, validation, and query helpers for the blog module.
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const highlightjs = require("highlight.js");
const { kv } = require("./kv");

const KV_POSTS_KEY = "blog:posts";
const POSTS_PER_PAGE = 5;
const DEFAULT_PAGE_NUMBER = 1;
const MAX_SEARCH_QUERY_LENGTH = 80;
const MAX_SLUG_LENGTH = 80;
const MAX_TITLE_LENGTH = 120;
const MAX_CATEGORY_LENGTH = 60;
const MAX_TAG_LENGTH = 40;
const MAX_EXCERPT_LENGTH = 220;
const MAX_MARKDOWN_LENGTH = 200000;
const MARKDOWN_EXTENSION = ".md";
const HTML_EXTENSION = ".html";
const VALID_VIEW_MODES = new Set(["card", "list"]);
const DEFAULT_VIEW_MODE = "card";

const markdownRenderer = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(markdownCode, languageName) {
    if (languageName && highlightjs.getLanguage(languageName)) {
      try {
        return highlightjs.highlight(markdownCode, { language: languageName }).value;
      } catch (error) {
        return markdownRenderer.utils.escapeHtml(markdownCode);
      }
    }

    return markdownRenderer.utils.escapeHtml(markdownCode);
  }
});

/**
 * Reads all posts from KV storage.
 *
 * @returns {Promise<Array<object>>} Posts sorted by newest first.
 */
async function getPosts() {
  const posts = await kv.get(KV_POSTS_KEY);
  return posts || [];
}

/**
 * Parses Markdown and Front Matter into a template-ready post object.
 *
 * @param {string} rawContent Raw Markdown file content.
 * @param {string} slug URL slug.
 * @returns {object} Parsed post object.
 */
function parseMarkdownPost(rawContent, slug) {
  let parsedPost;

  try {
    parsedPost = matter(rawContent);
  } catch (error) {
    throw new Error(`Unable to parse Markdown post "${slug}": ${error.message}`);
  }

  const post = {
    slug,
    fileName: `${slug}${MARKDOWN_EXTENSION}`,
    filePath: `${slug}${MARKDOWN_EXTENSION}`,
    raw: rawContent,
    title: parsedPost.data.title,
    date: normalizeDate(parsedPost.data.date),
    category: parsedPost.data.category,
    tags: normalizeTags(parsedPost.data.tags),
    excerpt: parsedPost.data.excerpt,
    content: parsedPost.content.trim(),
    html: markdownRenderer.render(parsedPost.content)
  };

  validatePost(post);
  return post;
}

/**
 * Parses an HTML file into a template-ready post object.
 * Supports optional YAML front matter.
 *
 * @param {string} rawContent Raw HTML file content.
 * @param {string} slug URL slug.
 * @returns {object} Parsed post object.
 */
function parseHtmlPost(rawContent, slug) {
  const fileName = `${slug}${HTML_EXTENSION}`;

  let parsedPost;
  try {
    parsedPost = matter(rawContent);
  } catch {
    return {
      slug, fileName, filePath: fileName, raw: rawContent,
      title: slug.replace(/[-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      date: new Date().toISOString().slice(0, 10),
      category: "Uncategorized", tags: [], excerpt: "HTML 页面",
      content: rawContent.trim(), html: rawContent.trim()
    };
  }

  const body = parsedPost.content.trim();
  return {
    slug, fileName, filePath: fileName, raw: rawContent,
    title: parsedPost.data.title || slug,
    date: normalizeDate(parsedPost.data.date) || new Date().toISOString().slice(0, 10),
    category: parsedPost.data.category || "Uncategorized",
    tags: normalizeTags(parsedPost.data.tags),
    excerpt: parsedPost.data.excerpt || "HTML 页面",
    content: body,
    html: body
  };
}

/**
 * Validates a parsed Markdown post.
 *
 * @param {object} post Parsed post record.
 * @returns {void}
 * @throws {Error} When required post fields are missing or invalid.
 */
function validatePost(post) {
  const requiredStringFields = ["slug", "title", "date", "category", "excerpt", "content"];
  const hasValidStringFields = requiredStringFields.every((fieldName) => {
    return typeof post[fieldName] === "string" && post[fieldName].trim().length > 0;
  });

  if (!hasValidStringFields || !Array.isArray(post.tags)) {
    throw new Error(`Post "${post.slug}" must include title, date, category, tags, excerpt, and content.`);
  }

  if (sanitizeSlug(post.slug) !== post.slug) {
    throw new Error(`Post "${post.slug}" has an unsafe file name.`);
  }

  if (Number.isNaN(new Date(post.date).getTime())) {
    throw new Error(`Post "${post.slug}" has an invalid date.`);
  }
}

/**
 * Saves a new Markdown post.
 *
 * @param {object} postInput Form input.
 * @returns {Promise<object>} Saved post metadata.
 */
async function createPost(postInput) {
  const normalizedPost = normalizePostInput(postInput);
  const posts = await getPosts();

  if (posts.some((post) => post.slug === normalizedPost.slug)) {
    throw new Error("A post with this slug already exists.");
  }

  const rawContent = buildMarkdownFile(normalizedPost);
  const post = parseMarkdownPost(rawContent, normalizedPost.slug);
  posts.push(post);
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  await kv.set(KV_POSTS_KEY, posts);
  return post;
}

/**
 * Updates an existing Markdown post.
 *
 * @param {string} slug Existing post slug.
 * @param {object} postInput Form input.
 * @returns {Promise<object>} Updated post metadata.
 */
async function updatePost(slug, postInput) {
  const safeSlug = requireSafeSlug(slug);
  const posts = await getPosts();
  const index = posts.findIndex((post) => post.slug === safeSlug);

  if (index === -1) {
    throw new Error("Post not found.");
  }

  const normalizedPost = normalizePostInput({ ...postInput, slug: safeSlug });
  const rawContent = buildMarkdownFile(normalizedPost);
  posts[index] = parseMarkdownPost(rawContent, normalizedPost.slug);
  await kv.set(KV_POSTS_KEY, posts);
  return posts[index];
}

/**
 * Deletes one Markdown post file.
 *
 * @param {string} slug Existing post slug.
 * @returns {Promise<void>}
 */
async function deletePost(slug) {
  const safeSlug = requireSafeSlug(slug);
  const posts = await getPosts();
  const index = posts.findIndex((post) => post.slug === safeSlug);

  if (index === -1) {
    throw new Error("Post not found.");
  }

  posts.splice(index, 1);
  await kv.set(KV_POSTS_KEY, posts);
}

/**
 * Saves an uploaded file (.md or .html) to storage.
 *
 * @param {object} uploadFile Multer file object.
 * @param {object} [metadata] Optional title/date overrides from the upload form.
 * @returns {Promise<object>} Saved post metadata.
 */
async function saveUploadedMarkdownFile(uploadFile, metadata) {
  if (!uploadFile || !uploadFile.originalname || !uploadFile.buffer) {
    throw new Error("Please choose a file to upload.");
  }

  const name = uploadFile.originalname.toLocaleLowerCase();
  const isHtml = name.endsWith(HTML_EXTENSION);
  const isMd = name.endsWith(MARKDOWN_EXTENSION);

  if (!isMd && !isHtml) {
    throw new Error("Only .md and .html files can be uploaded.");
  }

  const slugFromFile = sanitizeSlug(uploadFile.originalname.replace(/\.(md|html)$/i, ""));
  const slug = metadata?.slug ? sanitizeSlug(metadata.slug) : slugFromFile;
  if (!slug) {
    throw new Error("Uploaded file name must contain letters or numbers.");
  }

  const posts = await getPosts();
  if (posts.some((post) => post.slug === slug)) {
    throw new Error("A post with this file name already exists.");
  }

  const rawContent = uploadFile.buffer.toString("utf8");
  const post = isHtml ? parseHtmlPost(rawContent, slug) : parseMarkdownPost(rawContent, slug);

  if (metadata) {
    if (metadata.title) post.title = String(metadata.title).trim();
    if (metadata.date) post.date = String(metadata.date).trim();
    if (metadata.category) post.category = String(metadata.category).trim();
    if (metadata.excerpt) post.excerpt = String(metadata.excerpt).trim();
    if (metadata.tags) post.tags = normalizeTags(metadata.tags);
  }

  // Persist metadata into raw content so it survives re-read from GitHub
  post.raw = buildFrontMatter(post) + post.content;

  posts.push(post);
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  await kv.set(KV_POSTS_KEY, posts);
  return post;
}

/**
 * Converts form values into validated Markdown post fields.
 *
 * @param {object} postInput Form input.
 * @returns {object} Normalized post fields.
 */
function normalizePostInput(postInput) {
  const slug = requireSafeSlug(postInput.slug);
  const title = requireBoundedText(postInput.title, "Title", MAX_TITLE_LENGTH);
  const date = requireBoundedText(postInput.date, "Date", MAX_CATEGORY_LENGTH);
  const category = requireBoundedText(postInput.category, "Category", MAX_CATEGORY_LENGTH);
  const excerpt = requireBoundedText(postInput.excerpt, "Excerpt", MAX_EXCERPT_LENGTH);
  const content = requireBoundedText(postInput.content, "Content", MAX_MARKDOWN_LENGTH);
  const tags = normalizeTags(postInput.tags);

  if (Number.isNaN(new Date(date).getTime())) {
    throw new Error("Date must be a valid date.");
  }

  if (tags.length === 0) {
    throw new Error("At least one tag is required.");
  }

  return { slug, title, date, category, tags, excerpt, content };
}

/**
 * Builds YAML Front Matter string from post metadata.
 *
 * @param {object} post Post with metadata fields.
 * @returns {string} Front Matter block.
 */
function buildFrontMatter(post) {
  const tagsText = post.tags.map((tag) => `  - ${tag}`).join("\n");

  return [
    "---",
    `title: ${post.title}`,
    `date: ${post.date}`,
    `category: ${post.category}`,
    "tags:",
    tagsText,
    `excerpt: ${post.excerpt}`,
    "---",
    ""
  ].join("\n");
}

/**
 * Builds Markdown text with Front Matter.
 *
 * @param {object} postInput Validated post input.
 * @returns {string} Markdown file content.
 */
function buildMarkdownFile(postInput) {
  const tagsText = postInput.tags.map((tag) => `  - ${tag}`).join("\n");

  return [
    "---",
    `title: ${postInput.title}`,
    `date: ${postInput.date}`,
    `category: ${postInput.category}`,
    "tags:",
    tagsText,
    `excerpt: ${postInput.excerpt}`,
    "---",
    "",
    postInput.content.trim(),
    ""
  ].join("\n");
}

/**
 * Converts arbitrary query input to a safe page number.
 *
 * @param {unknown} pageQuery Query parameter value.
 * @returns {number} Positive integer page number.
 */
function sanitizePageNumber(pageQuery) {
  const parsedPage = Number.parseInt(String(pageQuery || DEFAULT_PAGE_NUMBER), 10);

  if (Number.isNaN(parsedPage) || parsedPage < DEFAULT_PAGE_NUMBER) {
    return DEFAULT_PAGE_NUMBER;
  }

  return parsedPage;
}

/**
 * Limits search input length before using it for matching.
 *
 * @param {unknown} searchQuery Query parameter value.
 * @returns {string} Trimmed search text.
 */
function sanitizeSearchQuery(searchQuery) {
  if (typeof searchQuery !== "string") {
    return "";
  }

  return searchQuery.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);
}

/**
 * Normalizes view mode to a supported template variant.
 *
 * @param {unknown} viewMode Query parameter value.
 * @returns {string} View mode name.
 */
function sanitizeViewMode(viewMode) {
  if (typeof viewMode !== "string" || !VALID_VIEW_MODES.has(viewMode)) {
    return DEFAULT_VIEW_MODE;
  }

  return viewMode;
}

/**
 * Normalizes text into a URL-safe slug.
 *
 * @param {unknown} rawSlug Input slug.
 * @returns {string} URL-safe slug.
 */
function sanitizeSlug(rawSlug) {
  if (typeof rawSlug !== "string") {
    return "";
  }

  return rawSlug
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SLUG_LENGTH);
}

/**
 * Returns a page slice and pagination metadata.
 *
 * @param {Array<object>} posts Posts to paginate.
 * @param {number} requestedPage Requested page number.
 * @param {number} postsPerPage Page size.
 * @returns {object} Page posts and navigation metadata.
 */
function paginatePosts(posts, requestedPage, postsPerPage) {
  const totalPages = Math.max(Math.ceil(posts.length / postsPerPage), DEFAULT_PAGE_NUMBER);
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - DEFAULT_PAGE_NUMBER) * postsPerPage;

  return {
    posts: posts.slice(startIndex, startIndex + postsPerPage),
    currentPage,
    totalPages,
    hasPreviousPage: currentPage > DEFAULT_PAGE_NUMBER,
    hasNextPage: currentPage < totalPages
  };
}

/**
 * Finds a post by URL slug.
 *
 * @param {Array<object>} posts Available posts.
 * @param {string} slug URL slug.
 * @returns {object|null} Matching post or null.
 */
function getPostBySlug(posts, slug) {
  return posts.find((post) => post.slug === slug) || null;
}

/**
 * Filters posts by keyword across common article fields.
 *
 * @param {Array<object>} posts Available posts.
 * @param {string} searchQuery Search keyword.
 * @returns {Array<object>} Matching posts.
 */
function filterPostsBySearch(posts, searchQuery) {
  if (!searchQuery) {
    return posts;
  }

  const normalizedQuery = searchQuery.toLocaleLowerCase();

  return posts.filter((post) => {
    const searchableText = [
      post.title,
      post.excerpt,
      post.category,
      post.tags.join(" "),
      post.content
    ].join(" ").toLocaleLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

/**
 * Filters posts by exact category name.
 *
 * @param {Array<object>} posts Available posts.
 * @param {string} category Category name.
 * @returns {Array<object>} Matching posts.
 */
function filterPostsByCategory(posts, category) {
  return posts.filter((post) => post.category.toLocaleLowerCase() === category.toLocaleLowerCase());
}

/**
 * Filters posts by exact tag name.
 *
 * @param {Array<object>} posts Available posts.
 * @param {string} tag Tag name.
 * @returns {Array<object>} Matching posts.
 */
function filterPostsByTag(posts, tag) {
  return posts.filter((post) => {
    return post.tags.some((postTag) => postTag.toLocaleLowerCase() === tag.toLocaleLowerCase());
  });
}

/**
 * Builds category and tag counts for navigation pages.
 *
 * @param {Array<object>} posts Available posts.
 * @returns {object} Category and tag archives.
 */
function buildArchive(posts) {
  const categoryMap = new Map();
  const tagMap = new Map();

  posts.forEach((post) => {
    categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return {
    categories: buildArchiveItems(categoryMap),
    tags: buildArchiveItems(tagMap)
  };
}

/**
 * Converts archive counts to template-friendly sorted items.
 *
 * @param {Map<string, number>} archiveMap Archive count map.
 * @returns {Array<object>} Sorted archive items.
 */
function buildArchiveItems(archiveMap) {
  return Array.from(archiveMap.entries())
    .map(([name, count]) => ({ name, count }))
    .toSorted((leftItem, rightItem) => leftItem.name.localeCompare(rightItem.name));
}

/**
 * Requires a valid slug and returns it.
 *
 * @param {unknown} slug Input slug.
 * @returns {string} Safe slug.
 */
function requireSafeSlug(slug) {
  const safeSlug = sanitizeSlug(slug);

  if (!safeSlug) {
    throw new Error("Slug is required and must contain letters or numbers.");
  }

  return safeSlug;
}

/**
 * Requires bounded text input.
 *
 * @param {unknown} value Input value.
 * @param {string} label Field label.
 * @param {number} maxLength Maximum allowed length.
 * @returns {string} Trimmed text.
 */
function requireBoundedText(value, label, maxLength) {
  if (typeof value !== "string") {
    throw new Error(`${label} is required.`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`${label} is required.`);
  }

  if (trimmedValue.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }

  return trimmedValue;
}

/**
 * Normalizes tag input from Front Matter or forms.
 *
 * @param {unknown} tags Tag input.
 * @returns {Array<string>} Tag list.
 */
function normalizeTags(tags) {
  const rawTags = Array.isArray(tags) ? tags : String(tags || "").split(",");

  return rawTags
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .map((tag) => tag.slice(0, MAX_TAG_LENGTH));
}

/**
 * Normalizes YAML Date objects to YYYY-MM-DD strings.
 *
 * @param {unknown} dateValue Date input.
 * @returns {string} Date string.
 */
function normalizeDate(dateValue) {
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue.toISOString().slice(0, 10);
  }

  return typeof dateValue === "string" ? dateValue : "";
}

module.exports = {
  POSTS_PER_PAGE,
  buildArchive,
  createPost,
  deletePost,
  filterPostsByCategory,
  filterPostsBySearch,
  filterPostsByTag,
  getPostBySlug,
  getPosts,
  normalizePostInput,
  paginatePosts,
  parseMarkdownPost,
  parseHtmlPost,
  sanitizePageNumber,
  sanitizeSearchQuery,
  sanitizeSlug,
  sanitizeViewMode,
  saveUploadedMarkdownFile,
  updatePost
};
