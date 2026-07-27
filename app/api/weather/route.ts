import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_STATION_NAMES } from "../../stations";
import { KMA_ENDPOINTS, getKmaAuthKey, withAuth } from "../../../lib/kma/config";
import { demoObservation } from "../../../lib/kma/demo";
import { fetchKma } from "../../../lib/kma/http";
import { parseObservation } from "../../../lib/kma/parsers";
import { latestObservationTimestamp } from "../../../lib/kma/time";

export async function GET(request: NextRequest) {
  const stn = request.nextUrl.searchParams.get("stn") || "108";
  const requestedName = request.nextUrl.searchParams.get("name");
  const stationName = requestedName || FALLBACK_STATION_NAMES[stn] || `지점 ${stn}`;
  const authKey = getKmaAuthKey();
  if (!authKey) return NextResponse.json(demoObservation(stn, requestedName));

  const params = withAuth(
    { tm2: latestObservationTimestamp(), stn, disp: "0", help: "0" },
    authKey,
  );
  try {
    const response = await fetchKma(KMA_ENDPOINTS.observations, params);
    return NextResponse.json(
      parseObservation(await response.text(), stn, stationName),
    );
  } catch {
    return NextResponse.json(demoObservation(stn, requestedName));
  }
}
