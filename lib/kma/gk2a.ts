const KST_OFFSET_MS = 9 * 60 * 60_000;
const IMAGE_TIMESTAMP = /^\d{12}$/;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function utcTimestamp(date: Date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
  ].join("");
}

/**
 * 레이더 프레임 시각(YYYYMMDDHHmm, KST)을 GK2A API 시각(UTC)으로 바꾼다.
 * Date의 로컬 타임존을 사용하지 않아 자정과 월·연도 경계도 동일하게 처리된다.
 */
export function radarKstToGk2aUtc(timestamp: string) {
  if (!IMAGE_TIMESTAMP.test(timestamp)) {
    throw new Error("Invalid KST image timestamp");
  }

  const year = Number(timestamp.slice(0, 4));
  const month = Number(timestamp.slice(4, 6));
  const day = Number(timestamp.slice(6, 8));
  const hour = Number(timestamp.slice(8, 10));
  const minute = Number(timestamp.slice(10, 12));
  const representedAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const date = new Date(representedAsUtc);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute
  ) {
    throw new Error("Invalid KST image timestamp");
  }

  return utcTimestamp(new Date(representedAsUtc - KST_OFFSET_MS));
}

/** GK2A 한반도 합성영상의 2분 간격 파일 시각으로 내림한다. */
export function snapGk2aUtcToRepositoryFrame(timestamp: string) {
  if (!IMAGE_TIMESTAMP.test(timestamp)) {
    throw new Error("Invalid UTC image timestamp");
  }

  const minute = Number(timestamp.slice(10, 12));
  return `${timestamp.slice(0, 10)}${pad(Math.floor(minute / 2) * 2)}`;
}
