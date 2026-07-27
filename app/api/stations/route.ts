import { NextResponse } from "next/server";
import { FALLBACK_STATIONS } from "../../stations";
import { KMA_ENDPOINTS, getKmaAuthKey, withAuth } from "../../../lib/kma/config";
import { fetchKma } from "../../../lib/kma/http";
import { parseStations } from "../../../lib/kma/parsers";
import { kstTimestamp } from "../../../lib/kma/time";

export async function GET() {
  const authKey = getKmaAuthKey();
  if (!authKey) {
    return NextResponse.json({
      stations: FALLBACK_STATIONS,
      live: false,
      count: FALLBACK_STATIONS.length,
    });
  }

  const params = withAuth({
    inf: "AWS",
    stn: "",
    tm: kstTimestamp(),
    help: "0",
  }, authKey);

  try {
    const response = await fetchKma(KMA_ENDPOINTS.stations, params);
    const stations = parseStations(await response.text());
    if (stations.length < 10) throw new Error("Station list is unexpectedly short");

    return NextResponse.json({ stations, live: true, count: stations.length });
  } catch {
    return NextResponse.json({
      stations: FALLBACK_STATIONS,
      live: false,
      count: FALLBACK_STATIONS.length,
    });
  }
}
