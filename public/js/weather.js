import { fetchWeather } from "./api.js";
import { setText, updateTime } from "./dom.js";

function weatherPresentation(data) {
  const rain = Number(data.rain15m);
  const temperature = Number(data.temperature);
  const wind = Number(data.windSpeed);
  const humidity = Number(data.humidity);

  if (Number.isFinite(rain) && rain > 0) {
    if (Number.isFinite(temperature) && temperature <= 1) {
      return { icon: "🌨️", condition: "눈 또는 진눈깨비" };
    }
    return { icon: "🌧️", condition: "비" };
  }
  if (Number.isFinite(wind) && wind >= 9) {
    return { icon: "🌬️", condition: "강풍" };
  }
  if (Number.isFinite(humidity) && humidity >= 85) {
    return { icon: "☁️", condition: "흐림" };
  }
  return { icon: "☀️", condition: "맑음" };
}

export async function loadWeather(stationSelect, refreshButton) {
  refreshButton.classList.add("loading");
  refreshButton.disabled = true;
  const station = stationSelect.value;
  const stationName = stationSelect.options[
    stationSelect.selectedIndex
  ].text.replace(/\s+\(\d+\)$/, "");

  try {
    const data = await fetchWeather(station, stationName);
    const { icon, condition } = weatherPresentation(data);
    const observationTime = data.observedAt && /^\d{12}$/.test(data.observedAt)
      ? `${data.observedAt.slice(8, 10)}:${data.observedAt.slice(10, 12)} 관측`
      : "최신 자료";

    setText("#heroStation", data.stationName, stationName);
    setText("#heroTemp", data.temperature);
    setText("#observationStation", data.stationName, stationName);
    setText("#observationStationCode", `지점 ${data.station || station}`);
    setText("#observationCondition", condition);
    setText("#observationWeatherIcon", icon);
    setText("#heroCondition", `${condition} · 관측 양호`);
    setText("#observationStatus", data.demo ? "시연 관측자료" : "실시간 관측 정상");
    setText("#observationTime", observationTime);
    setText("#tempValue", data.temperature);
    setText("#humidityValue", data.humidity);
    setText("#windValue", data.windSpeed);
    setText("#rainValue", data.rainDay);
    setText("#summaryWindValue", data.windSpeed);
    setText("#summaryRainValue", data.rainDay);
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
