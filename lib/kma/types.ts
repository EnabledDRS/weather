export type Observation = {
  station: string;
  stationName: string;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  rain15m: number | null;
  rainDay: number | null;
  observedAt: string | null;
  demo: boolean;
};
