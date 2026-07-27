import { fetchStations } from "./api.js";
import { $ } from "./dom.js";

function stationFromOption(option) {
  return {
    id: option.value,
    name: option.text.replace(/\s+\(\d+\)$/, ""),
  };
}

export function createStationController(stationSelect, stationSearch) {
  let allStations = [...stationSelect.options].map(stationFromOption);

  function render(stations, selectedId = stationSelect.value) {
    stationSelect.replaceChildren(
      ...stations.map(({ id, name }) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = `${name} (${id})`;
        return option;
      }),
    );
    if (stations.some(({ id }) => id === selectedId)) {
      stationSelect.value = selectedId;
    }
  }

  async function load() {
    try {
      const data = await fetchStations();
      if (!Array.isArray(data.stations) || data.stations.length === 0) return;
      allStations = data.stations;
      render(allStations);
      $("#stationCount").textContent =
        `${data.count ?? allStations.length}개 지점`;
      stationSelect.setAttribute(
        "aria-label",
        data.live ? "기상청 운영 중 AWS 전체 지점" : "전국 주요 AWS 지점",
      );
    } catch {
      $("#stationCount").textContent = `${allStations.length}개 지점`;
    }
  }

  function filter() {
    const query = stationSearch.value.trim().toLowerCase();
    const matches = query
      ? allStations.filter(({ id, name }) =>
          `${name} ${id}`.toLowerCase().includes(query))
      : allStations;
    render(matches);
    $("#stationCount").textContent = query
      ? `${matches.length}개 검색됨`
      : `${allStations.length}개 지점`;
  }

  return { load, filter };
}
