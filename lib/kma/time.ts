export function kstTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = Object.fromEntries(
    parts.map(({ type, value: partValue }) => [type, partValue]),
  );
  return `${value.year}${value.month}${value.day}${value.hour}${value.minute}`;
}

// AWS 분자료는 수집·품질검사 직후 몇 분간 결측으로 응답할 수 있습니다.
export function latestObservationTimestamp(delayMinutes = 10) {
  return kstTimestamp(new Date(Date.now() - delayMinutes * 60_000));
}
