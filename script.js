const allStations = [
  { id: "90", name: "속초" },
  { id: "93", name: "북춘천" },
  { id: "95", name: "철원" },
  { id: "98", name: "동두천" },
  { id: "99", name: "파주" },
  { id: "100", name: "대관령" },
  { id: "101", name: "춘천" },
  { id: "102", name: "백령도" },
  { id: "104", name: "북강릉" },
  { id: "105", name: "강릉" },
  { id: "106", name: "동해" },
  { id: "108", name: "서울" },
  { id: "112", name: "인천" },
  { id: "114", name: "원주" },
  { id: "115", name: "울릉도" },
  { id: "116", name: "관악산" },
  { id: "119", name: "수원" },
  { id: "121", name: "영월" },
  { id: "127", name: "충주" },
  { id: "129", name: "서산" },
  { id: "130", name: "울진" },
  { id: "131", name: "청주" },
  { id: "133", name: "대전" },
  { id: "135", name: "추풍령" },
  { id: "136", name: "안동" },
  { id: "137", name: "상주" },
  { id: "138", name: "포항" },
  { id: "140", name: "군산" },
  { id: "143", name: "대구" },
  { id: "146", name: "전주" },
  { id: "152", name: "울산" },
  { id: "155", name: "창원" },
  { id: "156", name: "광주" },
  { id: "159", name: "부산" },
  { id: "162", name: "통영" },
  { id: "165", name: "목포" },
  { id: "168", name: "여수" },
  { id: "169", name: "흑산도" },
  { id: "170", name: "완도" },
  { id: "172", name: "고창" },
  { id: "174", name: "순천" },
  { id: "177", name: "홍성" },
  { id: "184", name: "제주" },
  { id: "185", name: "고산" },
  { id: "188", name: "성산" },
  { id: "189", name: "서귀포" },
  { id: "192", name: "진주" },
  { id: "201", name: "강화" },
  { id: "202", name: "양평" },
  { id: "203", name: "이천" },
  { id: "211", name: "인제" },
  { id: "212", name: "홍천" },
  { id: "216", name: "태백" },
  { id: "217", name: "정선군" },
  { id: "221", name: "제천" },
  { id: "226", name: "보은" },
  { id: "232", name: "천안" },
  { id: "235", name: "보령" },
  { id: "236", name: "부여" },
  { id: "238", name: "금산" },
  { id: "239", name: "세종" },
  { id: "243", name: "부안" },
  { id: "244", name: "임실" },
  { id: "245", name: "정읍" },
  { id: "247", name: "남원" },
  { id: "248", name: "장수" },
  { id: "251", name: "고창군" },
  { id: "252", name: "영광군" },
  { id: "253", name: "김해시" },
  { id: "254", name: "순창군" },
  { id: "255", name: "북창원" },
  { id: "257", name: "양산시" },
  { id: "258", name: "보성군" },
  { id: "259", name: "강진군" },
  { id: "260", name: "장흥" },
  { id: "261", name: "해남" },
  { id: "262", name: "고흥" },
  { id: "263", name: "의령군" },
  { id: "264", name: "함양군" },
  { id: "266", name: "광양시" },
  { id: "268", name: "진도군" },
  { id: "271", name: "봉화" },
  { id: "272", name: "영주" },
  { id: "273", name: "문경" },
  { id: "276", name: "청송군" },
  { id: "277", name: "영덕" },
  { id: "278", name: "의성" },
  { id: "279", name: "구미" },
  { id: "281", name: "영천" },
  { id: "283", name: "경주시" },
  { id: "284", name: "거창" },
  { id: "285", name: "합천" },
  { id: "288", name: "밀양" },
  { id: "289", name: "산청" },
  { id: "294", name: "거제" },
  { id: "295", name: "남해" }
];

const $ = (selector) => document.querySelector(selector);
const stationSelect = $("#stationSelect");
const refreshButton = $("#refreshButton");
const stationSearch = $("#stationSearch");
let currentTemperature = 23.4;

function demoData(station) {
  const seed = Number(station.id) || 108;
  return {
    name: station.name,
    temperature: Number((18 + (seed % 91) / 10).toFixed(1)),
    humidity: 45 + (seed % 36),
    windSpeed: Number((0.8 + (seed % 47) / 10).toFixed(1)),
    rainDay: seed % 11 === 0 ? Number(((seed % 24) / 10).toFixed(1)) : 0
  };
}

function updateTime() {
  const time = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false
  }).format(new Date());
  $("#updatedAt").textContent = `마지막 업데이트 ${time}`;
}

function renderWeather(data, demo = true) {
  currentTemperature = Number(data.temperature) || 0;
  $("#heroStation").textContent = data.name ?? data.stationName;
  $("#heroTemp").textContent = data.temperature;
  $("#tempValue").textContent = data.temperature;
  $("#humidityValue").textContent = data.humidity;
  $("#windValue").textContent = data.windSpeed;
  $("#rainValue").textContent = data.rainDay;
  $("#dataMode").textContent = demo ? "시연 데이터" : "실시간 관측";
  updateTime();
  renderHours();
}

function selectedStation() {
  const id = stationSelect.value;
  return allStations.find((station) => station.id === id) ?? allStations.find((station) => station.id === "108");
}

async function loadWeather() {
  const station = selectedStation();
  refreshButton.classList.add("loading");
  refreshButton.disabled = true;
  try {
    const query = new URLSearchParams({ stn: station.id, name: station.name });
    const response = await fetch(`api/weather?${query}`, { cache: "no-store" });
    if (!response.ok) throw new Error("API backend is not connected");
    const data = await response.json();
    renderWeather({ ...data, name: data.stationName ?? station.name }, Boolean(data.demo));
  } catch {
    renderWeather(demoData(station), true);
  } finally {
    refreshButton.classList.remove("loading");
    refreshButton.disabled = false;
  }
}

function renderStations(stations, selectedId = stationSelect.value) {
  stationSelect.replaceChildren(...stations.map(({ id, name }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${name} (${id})`;
    return option;
  }));
  if (stations.some(({ id }) => id === selectedId)) stationSelect.value = selectedId;
}

function filterStations() {
  const query = stationSearch.value.trim().toLowerCase();
  const matches = query
    ? allStations.filter(({ id, name }) => `${name} ${id}`.toLowerCase().includes(query))
    : allStations;
  renderStations(matches);
  $("#stationCount").textContent = query ? `${matches.length}개 검색됨` : `${allStations.length}개 지점`;
}

function renderHours() {
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul", hour: "2-digit", hour12: false
  }).format(new Date()));
  const changes = [0, -0.4, -0.8, -1.3, -2.0, -2.8, -3.4, -4.0];
  $("#hourStrip").innerHTML = changes.map((change, index) => {
    const itemHour = (hour + index) % 24;
    const icon = itemHour >= 19 || itemHour < 6 ? "☾" : "☀";
    return `<div class="hour-item"><time>${itemHour}시</time><span>${icon}</span><strong>${Math.round(currentTemperature + change)}°</strong></div>`;
  }).join("");
}

function refreshMap() {
  const image = $("#warningImage");
  image.style.display = "none";
  $("#mapPlaceholder").style.display = "block";
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
stationSelect.addEventListener("change", loadWeather);
refreshButton.addEventListener("click", loadWeather);
stationSearch.addEventListener("input", filterStations);
stationSearch.addEventListener("change", () => { filterStations(); loadWeather(); });
$("#mapRefresh").addEventListener("click", refreshMap);
$(".menu-button").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
document.querySelectorAll(".sidebar nav a").forEach((link) => {
  link.addEventListener("click", () => $(".sidebar").classList.remove("open"));
});

renderStations(allStations, "108");
updateTime();
loadWeather();
refreshMap();
