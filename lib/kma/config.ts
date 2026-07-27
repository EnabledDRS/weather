export const KMA_ENDPOINTS = {
  stations: "https://apihub.kma.go.kr/api/typ01/url/stn_inf.php",
  observations:
    "https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-aws2_min",
  warningStatus:
    "https://apihub.kma.go.kr/api/typ01/url/wrn_now_data_new.php",
  warningStatusLegacy:
    "https://apihub.kma.go.kr/api/typ01/url/wrn_now_data.php",
  warnings: "https://apihub.kma.go.kr/api/typ03/cgi/wrn/nph-wrn7",
} as const;

export function getKmaAuthKey() {
  return process.env.KMA_AUTH_KEY?.trim() || null;
}

export function withAuth(
  values: Record<string, string>,
  authKey: string,
) {
  return new URLSearchParams({ ...values, authKey });
}
