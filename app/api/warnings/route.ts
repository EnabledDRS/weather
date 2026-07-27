import { NextResponse } from "next/server";
import { KMA_ENDPOINTS, getKmaAuthKey, withAuth } from "../../../lib/kma/config";
import { fetchKma } from "../../../lib/kma/http";
import { getCurrentWarningAnnouncementTime } from "../../../lib/kma/warnings";

export async function GET() {
  const authKey = getKmaAuthKey();
  if (!authKey) return new NextResponse(null, { status: 404 });

  try {
    const warningTime = await getCurrentWarningAnnouncementTime(authKey);
    const params = withAuth({
      out: "0",
      tmef: "1",
      city: "1",
      name: "0",
      tm: warningTime,
      lon: "127.7",
      lat: "36.1",
      range: "500",
      size: "900",
      wrn: "W|R|C|D|O|N|V|T|S|Y|H|F|K",
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
