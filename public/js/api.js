async function getJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} request failed`);
  return response.json();
}

export function fetchStations() {
  return getJson("/api/stations");
}

export function fetchWeather(station, stationName) {
  const query = new URLSearchParams({ stn: station, name: stationName });
  return getJson(`/api/weather?${query}`);
}

export function warningImageUrl() {
  return `/api/warnings?t=${Date.now()}`;
}

export function radarImageUrl() {
  return `/api/radar?t=${Date.now()}`;
}
