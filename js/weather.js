import { fetchWeather } from "./api.js";
import { setText, updateTime } from "./dom.js";

export async function loadWeather(stationSelect, refreshButton) {
  refreshButton.classList.add("loading");
  refreshButton.disabled = true;
  const station = stationSelect.value;
  const stationName = stationSelect.options[
    stationSelect.selectedIndex
  ].text.replace(/\s+\(\d+\)$/, "");

  try {
    const data = await fetchWeather(station, stationName);
    setText("#heroStation", data.stationName, stationName);
    setText("#heroTemp", data.temperature);
    setText("#tempValue", data.temperature);
    setText("#humidityValue", data.humidity);
    setText("#windValue", data.windSpeed);
    setText("#rainValue", data.rainDay);
    setText("#dataMode", data.demo ? "시연 데이터" : "실시간 관측");
    updateTime();
  } catch {
    setText("#dataMode", "연결 확인 필요");
    updateTime();
  } finally {
    refreshButton.classList.remove("loading");
    refreshButton.disabled = false;
  }
}
