export const $ = (selector) => document.querySelector(selector);

export function setText(selector, value, fallback = "—") {
  const element = $(selector);
  if (element) element.textContent = value ?? fallback;
}

export function updateTime() {
  const formatted = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  setText("#updatedAt", `마지막 업데이트 ${formatted}`);
}
