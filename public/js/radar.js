import { radarImageUrl } from "./api.js";

export function createRadarController(image, placeholder, updatedAt) {
  function refresh() {
    image.style.display = "none";
    placeholder.style.display = "grid";
    updatedAt.textContent = "최신 자료 확인 중";
    image.src = radarImageUrl();
  }

  image.addEventListener("load", () => {
    if (image.naturalWidth > 1 && image.naturalHeight > 1) {
      image.style.display = "block";
      placeholder.style.display = "none";
      updatedAt.textContent = "HSR · 5분 간격";
    }
  });

  image.addEventListener("error", () => {
    image.style.display = "none";
    placeholder.style.display = "grid";
    updatedAt.textContent = "자료 수신 대기";
  });

  return { refresh };
}
