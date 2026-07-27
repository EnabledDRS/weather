import { NextResponse } from "next/server";
import { getKmaAuthKey } from "../../../lib/kma/config";
import { fetchLatestRadarImage } from "../../../lib/kma/radar";

export async function GET() {
  const authKey = getKmaAuthKey();
  if (!authKey) return new NextResponse(null, { status: 404 });

  try {
    const { response, tm, contentType } = await fetchLatestRadarImage(authKey);

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=240, stale-while-revalidate=60",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "X-KMA-Radar-Time": tm,
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
