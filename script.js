const stations = {
  "108": { name: "서울", temperature: 23.4, humidity: 58, windSpeed: 2.1, rainDay: 0.0 },
  "112": { name: "인천", temperature: 22.8, humidity: 64, windSpeed: 3.4, rainDay: 0.0 },
  "119": { name: "수원", temperature: 23.1, humidity: 61, windSpeed: 1.8, rainDay: 0.0 },
  "105": { name: "강릉", temperature: 24.2, humidity: 55, windSpeed: 2.7, rainDay: 0.0 },
  "133": { name: "대전", temperature: 24.0, humidity: 59, windSpeed: 1.5, rainDay: 0.0 },
  "143": { name: "대구", temperature: 25.3, humidity: 52, windSpeed: 1.9, rainDay: 0.0 },
  "156": { name: "광주", temperature: 24.7, humidity: 63, windSpeed: 2.0, rainDay: 0.0 },
  "159": { name: "부산", temperature: 23.8, humidity: 68, windSpeed: 3.1, rainDay: 0.0 },
  "184": { name: "제주", temperature: 25.0, humidity: 71, windSpeed: 4.2, rainDay: 0.0 }
};

const $ = (selector) => document.querySelector(selector);
const stationSelect = $("#stationSelect");
const refreshButton = $("#refreshButton");
const stationSearch = $("#stationSearch");

function updateTime() {
  const time = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
  $("#updatedAt").textContent = `마지막 업데이트 ${time}`;
}

function renderWeather(data, demo = true) {
  $("#heroStation").textContent = data.name ?? data.stationName;
  $("#heroTemp").textContent = data.temperature;
  $("#tempValue").textContent = data.temperature;
  $("#humidityValue").textContent = data.humidity;
  $("#windValue").textContent = data.windSpeed;
  $("#rainValue").textContent = data.rainDay;
  $("#dataMode").textContent = demo ? "시연 데이터" : "실시간 관측";
  updateTime();
}

async function loadWeather() {
  const station = stationSelect.value;
  refreshButton.classList.add("loading");
  refreshButton.disabled = true;
  try {
    const response = await fetch(`api/weather?stn=${encodeURIComponent(station)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("API backend is not connected");
    const data = await response.json();
    renderWeather({ ...data, name: data.stationName ?? stations[station].name }, Boolean(data.demo));
  } catch {
    renderWeather(stations[station], true);
  } finally {
    refreshButton.classList.remove("loading");
    refreshButton.disabled = false;
  }
}

function filterStations() {
  const query = stationSearch.value.trim().toLowerCase();
  let firstMatch;
  [...stationSelect.options].forEach((option) => {
    const matches = option.text.toLowerCase().includes(query);
    option.hidden = Boolean(query) && !matches;
    if (matches && !firstMatch) firstMatch = option;
  });
  if (query && firstMatch) stationSelect.value = firstMatch.value;
}

function renderHours() {
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    hour12: false
  }).format(now));
  const base = stations[stationSelect.value].temperature;
  const temperatures = [0, -0.4, -0.8, -1.3, -2.0, -2.8, -3.4, -4.0];
  $("#hourStrip").innerHTML = temperatures.map((change, index) => {
    const itemHour = (hour + index) % 24;
    const icon = itemHour >= 19 || itemHour < 6 ? "☾" : "☀";
    return `<div class="hour-item"><time>${itemHour}시</time><span>${icon}</span><strong>${Math.round(base + change)}°</strong></div>`;
  }).join("");
}

function refreshMap() {
  const image = $("#warningImage");
  const placeholder = $("#mapPlaceholder");
  image.style.display = "none";
  placeholder.style.display = "block";
  image.src = `api/warnings?t=${Date.now()}`;
}

$("#warningImage").addEventListener("load", function () {
  if (this.naturalWidth > 1) {
    this.style.display = "block";
    $("#mapPlaceholder").style.display = "none";
  }
});
$("#warningImage").addEventListener("error", function () {
  this.style.display = "none";
  $("#mapPlaceholder").style.display = "block";
});
stationSelect.addEventListener("change", () => { loadWeather(); renderHours(); });
refreshButton.addEventListener("click", loadWeather);
stationSearch.addEventListener("input", filterStations);
stationSearch.addEventListener("change", () => { filterStations(); loadWeather(); renderHours(); });
$("#mapRefresh").addEventListener("click", refreshMap);
$(".menu-button").addEventListener("click", () => $(".sidebar").classList.toggle("open"));

document.querySelectorAll(".sidebar nav a").forEach((link) => {
  link.addEventListener("click", () => $(".sidebar").classList.remove("open"));
});

updateTime();
renderHours();
loadWeather();
refreshMap();
