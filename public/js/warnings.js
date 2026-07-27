import { warningImageUrl } from "./api.js";

export function createWarningController(image, placeholder) {
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  let refreshTimer;

  function refresh() {
    image.style.display = "none";
    placeholder.style.display = "block";
    image.src = warningImageUrl();
  }

  function scheduleNextRefresh() {
    const now = Date.now();
    const nextBoundary =
      Math.floor(now / FIVE_MINUTES_MS) * FIVE_MINUTES_MS + FIVE_MINUTES_MS;
    const delay = Math.max(1000, nextBoundary - now + 1000);

    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refresh();
      scheduleNextRefresh();
    }, delay);
  }

  image.addEventListener("load", () => {
    if (image.naturalWidth > 1 && image.naturalHeight > 1) {
      image.style.display = "block";
      placeholder.style.display = "none";
    }
  });
  image.addEventListener("error", () => {
    image.style.display = "none";
    placeholder.style.display = "block";
  });

  scheduleNextRefresh();

  return {
    refresh,
    destroy() {
      window.clearTimeout(refreshTimer);
    },
  };
}
