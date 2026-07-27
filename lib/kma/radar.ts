import { KMA_ENDPOINTS, withAuth } from "./config";
import { fetchKma } from "./http";
import { kstTimestamp } from "./time";

const FIVE_MINUTES = 5 * 60_000;

export function floorKstTimestampToFiveMinutes(date: Date) {
  const timestamp = kstTimestamp(date);
  const minute = Number(timestamp.slice(-2));
  const flooredMinute = Math.floor(minute / 5) * 5;
  return `${timestamp.slice(0, -2)}${String(flooredMinute).padStart(2, "0")}`;
}

export function radarTimestamp(delayMinutes = 15, attempt = 0) {
  return floorKstTimestampToFiveMinutes(
    new Date(Date.now() - delayMinutes * 60_000 - attempt * FIVE_MINUTES),
  );
}

function radarParams(tm: string, authKey: string) {
  return withAuth({
    tm,
    cmp: "HSR",
    qcd: "EXT",
    obs: "ECHO",
    color: "C4",
    aws: "0",
    acc: "",
    map: "HR",
    grid: "2",
    legend: "1",
    size: "900",
    itv: "5",
    zoom_level: "0",
    zoom_x: "0000000",
    zoom_y: "0000000",
    gov: "",
  }, authKey);
}

export async function fetchLatestRadarImage(authKey: string) {
  let lastError: unknown;

  // 생산 지연이나 특정 시각 누락을 고려해 5분 간격으로 최대 30분 전까지 재시도한다.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const tm = radarTimestamp(15, attempt);
    try {
      const response = await fetchKma(
        KMA_ENDPOINTS.radarImage,
        radarParams(tm, authKey),
        18_000,
      );
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().startsWith("image/")) {
        throw new Error("KMA radar response is not an image");
      }
      return { response, tm, contentType };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("No recent KMA radar image is available");
}
