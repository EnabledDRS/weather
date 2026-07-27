import { NextResponse } from "next/server";
import { KMA_ENDPOINTS, getKmaAuthKey, withAuth } from "../../../lib/kma/config";
import { fetchKma } from "../../../lib/kma/http";
import { latestFiveMinuteKstTimestamp } from "../../../lib/kma/warnings";

export async function GET() {
  const authKey = getKmaAuthKey();
  if (!authKey) return new NextResponse(null, { status: 404 });

  try {
    const warningTime = latestFiveMinuteKstTimestamp();
    const params = withAuth({
      out: "0",
      tmef: "1",
      city: "1",
      name: "0",
      tm: warningTime,
      lon: "127.80",
      lat: "35.90",
      range: "350",
      size: "400",
      wrn: "W,R,C,D,O,V,T,S,Y,H",
    }, authKey);
    const response = await fetchKma(KMA_ENDPOINTS.warnings, params);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return new NextResponse(null, { status: 502 });
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "X-KMA-Warning-Time": warningTime,
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
