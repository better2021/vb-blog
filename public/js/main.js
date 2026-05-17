// Purpose: Lightweight browser enhancements for view preference and destructive action confirmation.
const VIEW_QUERY_KEY = "view";
const VIEW_STORAGE_KEY = "blog-preferred-view";
const SUPPORTED_VIEW_MODES = new Set(["card", "list"]);

const currentUrl = new URL(window.location.href);
const currentViewMode = currentUrl.searchParams.get(VIEW_QUERY_KEY);

if (SUPPORTED_VIEW_MODES.has(currentViewMode)) {
  window.localStorage.setItem(VIEW_STORAGE_KEY, currentViewMode);
} else {
  const storedViewMode = window.localStorage.getItem(VIEW_STORAGE_KEY);

  if (SUPPORTED_VIEW_MODES.has(storedViewMode) && currentUrl.pathname === "/") {
    currentUrl.searchParams.set(VIEW_QUERY_KEY, storedViewMode);
    window.location.replace(currentUrl.toString());
  }
}

document.querySelectorAll(".delete-post-form").forEach((formElement) => {
  formElement.addEventListener("submit", (event) => {
    const postTitle = formElement.dataset.postTitle || "这篇文章";
    const confirmed = window.confirm(`确认删除《${postTitle}》吗？此操作不可撤销。`);

    if (!confirmed) {
      event.preventDefault();
    }
  });
});
