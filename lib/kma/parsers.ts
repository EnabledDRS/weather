import type { Station } from "../../app/stations";
import type { Observation } from "./types";

function dataLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function validNumber(value: string | undefined, minimum = -40) {
  const number = Number(value);
  return Number.isFinite(number) && number > minimum ? number : null;
}

export function parseStations(text: string): Station[] {
  const stations = dataLines(text)
    .map((line) => {
      const fields = line.replace(/\*/g, "").split(/\s+/);
      const id = fields[0];
      const lon = Number(fields[1]);
      const lat = Number(fields[2]);
      const name = fields.at(-1);

      if (
        !/^\d+$/.test(id) ||
        !name ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
      ) {
        return null;
      }
      return { id, name, lat, lon };
    })
    .filter((station): station is Station => station !== null);

  return [...new Map(stations.map((station) => [station.id, station])).values()]
    .sort((a, b) => Number(a.id) - Number(b.id));
}

export function parseObservation(
  text: string,
  station: string,
  stationName: string,
): Observation {
  const row = dataLines(text)[0];
  if (!row) throw new Error("KMA observation response is empty");
  const values = row.split(/\s+/);
  if (values.length < 15) throw new Error("KMA observation row is incomplete");

  return {
    station,
    stationName,
    observedAt: values[0] || null,
    temperature: validNumber(values[8]),
    humidity: validNumber(values[14]),
    windSpeed: validNumber(values[3]),
    rain15m: validNumber(values[10]),
    rainDay: validNumber(values[13]),
    demo: false,
  };
}
