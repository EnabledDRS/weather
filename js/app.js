import { $ , updateTime } from "./dom.js";
import { createStationController } from "./stations.js";
import { loadWeather } from "./weather.js";
import { createWarningController } from "./warnings.js";

const stationSelect = $("#stationSelect");
const stationSearch = $("#stationSearch");
const refreshButton = $("#refreshButton");
const warningImage = $("#warningImage");
const mapPlaceholder = $("#mapPlaceholder");

if (
  stationSelect &&
  stationSearch &&
  refreshButton &&
  warningImage &&
  mapPlaceholder
) {
  const stations = createStationController(stationSelect, stationSearch);
  const warnings = createWarningController(warningImage, mapPlaceholder);
  const refreshWeather = () => loadWeather(stationSelect, refreshButton);

  stationSelect.addEventListener("change", refreshWeather);
  refreshButton.addEventListener("click", refreshWeather);
  stationSearch.addEventListener("input", stations.filter);
  stationSearch.addEventListener("change", async () => {
    stations.filter();
    await refreshWeather();
  });
  $("#mapRefresh")?.addEventListener("click", warnings.refresh);
  $(".menu-button")?.addEventListener("click", () =>
    $(".sidebar")?.classList.toggle("open"));

  updateTime();
  stations.load().finally(refreshWeather);
}
