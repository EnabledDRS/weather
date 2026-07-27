import { FALLBACK_STATION_NAMES } from "../../app/stations";
import type { Observation } from "./types";

export function demoObservation(
  station: string,
  requestedName?: string | null,
): Observation {
  const seed = Number(station) || 108;
  return {
    station,
    stationName:
      requestedName || FALLBACK_STATION_NAMES[station] || `지점 ${station}`,
    temperature: Number((18 + (seed % 91) / 10).toFixed(1)),
    humidity: 45 + (seed % 36),
    windSpeed: Number((0.8 + (seed % 47) / 10).toFixed(1)),
    rain15m:
      seed % 11 === 0 ? Number(((seed % 8) / 10).toFixed(1)) : 0,
    rainDay:
      seed % 11 === 0 ? Number(((seed % 24) / 10).toFixed(1)) : 0,
    observedAt: null,
    demo: true,
  };
}
