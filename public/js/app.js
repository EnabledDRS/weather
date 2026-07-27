import { $ , updateTime } from "./dom.js";
import { createStationController } from "./stations.js";
import { loadWeather } from "./weather.js";
import { createWarningController } from "./warnings.js";
import { createRadarController } from "./radar.js";

const stationSelect = $("#stationSelect");
const stationSearch = $("#stationSearch");
const refreshButton = $("#refreshButton");
const warningImage = $("#warningImage");
const mapPlaceholder = $("#mapPlaceholder");
const radarImage = $("#radarImage");
const radarPlaceholder = $("#radarPlaceholder");
const radarUpdatedAt = $("#radarUpdatedAt");

if (
  stationSelect &&
  stationSearch &&
  refreshButton &&
  warningImage &&
  mapPlaceholder &&
  radarImage &&
  radarPlaceholder &&
  radarUpdatedAt
) {
  const stations = createStationController(stationSelect, stationSearch);
  const warnings = createWarningController(warningImage, mapPlaceholder);
  const radar = createRadarController(
    radarImage,
    radarPlaceholder,
    radarUpdatedAt,
  );
  const refreshWeather = () => loadWeather(stationSelect, refreshButton);

  stationSelect.addEventListener("change", refreshWeather);
  refreshButton.addEventListener("click", refreshWeather);
  stationSearch.addEventListener("input", stations.filter);
  stationSearch.addEventListener("change", async () => {
    stations.filter();
    await refreshWeather();
  });
  $("#mapRefresh")?.addEventListener("click", warnings.refresh);
  $("#radarRefresh")?.addEventListener("click", radar.refresh);
  $(".menu-button")?.addEventListener("click", () =>
    $(".sidebar")?.classList.toggle("open"));

  updateTime();
  stations.load().finally(refreshWeather);
}
