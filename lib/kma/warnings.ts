import { KMA_ENDPOINTS, withAuth } from "./config";
import { fetchKma } from "./http";

const KMA_TIMESTAMP = /\b\d{12}\b/g;
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 특보 이미지 API가 요구하는 한국시간(YYYYMMDDHHmm)을 현재 5분
 * 구간의 시작 시각으로 만든다. KST는 일광절약시간을 사용하지 않는다.
 */
export function latestFiveMinuteKstTimestamp(now = new Date()) {
  const roundedUtcMs =
    Math.floor(now.getTime() / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
  const kst = new Date(roundedUtcMs + KST_OFFSET_MS);
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    kst.getUTCFullYear(),
    pad(kst.getUTCMonth() + 1),
    pad(kst.getUTCDate()),
    pad(kst.getUTCHours()),
    pad(kst.getUTCMinutes()),
  ].join("");
}

/**
 * wrn_now_data(_new) 응답의 각 자료행에는 TM_FC, TM_EF 순으로
 * 12자리 시각이 들어온다. 지도 API의 tm은 발효 기준 화면에서도
 * "특보 발표시각"이므로 각 행의 첫 번째 시각(TM_FC)만 사용한다.
 */
export function latestWarningAnnouncementTime(text: string) {
  const times = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.match(KMA_TIMESTAMP)?.[0] ?? null)
    .filter((time): time is string => time !== null)
    .sort();

  return times.at(-1) ?? null;
}

async function fetchWarningStatus(
  endpoint: string,
  authKey: string,
) {
  const params = withAuth({
    fe: "e",
    tm: "",
    disp: "0",
    help: "0",
  }, authKey);
  const response = await fetchKma(endpoint, params);
  return response.text();
}

/**
 * 신 API를 우선 사용하고, 일시적인 호환성 문제가 있으면 기존 API로
 * 한 번 더 조회한다. 두 API 모두 현재 발효 중인 특보만 대상으로 한다.
 */
export async function getCurrentWarningAnnouncementTime(authKey: string) {
  let lastError: unknown;

  for (const endpoint of [
    KMA_ENDPOINTS.warningStatus,
    KMA_ENDPOINTS.warningStatusLegacy,
  ]) {
    try {
      const time = latestWarningAnnouncementTime(
        await fetchWarningStatus(endpoint, authKey),
      );
      if (time) return time;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  throw new Error("KMA warning status response has no active warning time");
}
