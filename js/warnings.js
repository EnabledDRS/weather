import { warningImageUrl } from "./api.js";

export function createWarningController(image, placeholder) {
  function refresh() {
    image.style.display = "none";
    placeholder.style.display = "block";
    image.src = warningImageUrl();
  }

  image.addEventListener("load", () => {
    if (image.naturalWidth > 1) {
      image.style.display = "block";
      placeholder.style.display = "none";
    }
  });
  image.addEventListener("error", () => {
    image.style.display = "none";
    placeholder.style.display = "block";
  });

  return { refresh };
}
