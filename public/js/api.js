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

export function radarImageUrl(tm) {
  const query = new URLSearchParams();
  if (tm) query.set("tm", tm);
  else query.set("t", Date.now());
  query.set("size", "400");
  query.set("v", "hsp-hso-hb-400");
  return `/api/radar?${query}`;
}

export function windRainImageUrl(date) {
  const query = new URLSearchParams();
  if (date) query.set("date", date);
  else query.set("t", Date.now());
  query.set("v", "rgb-cs-ko005lc");
  return `/api/wind-rain?${query}`;
}
