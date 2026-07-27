import { NextResponse } from "next/server";
import { getKmaAuthKey } from "../../../lib/kma/config";
import {
  fetchLatestRadarImage,
  fetchRadarImageAt,
} from "../../../lib/kma/radar";

const RADAR_TIMESTAMP = /^\d{12}$/;

export async function GET(request: Request) {
  const authKey = getKmaAuthKey();
  if (!authKey) return new NextResponse(null, { status: 404 });

  try {
    const requestedTime = new URL(request.url).searchParams.get("tm");
    if (requestedTime && !RADAR_TIMESTAMP.test(requestedTime)) {
      return new NextResponse(null, { status: 400 });
    }

    const { response, tm, contentType } = requestedTime
      ? await fetchRadarImageAt(authKey, requestedTime)
      : await fetchLatestRadarImage(authKey);

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": requestedTime
          ? "public, max-age=86400, immutable"
          : "public, max-age=240, stale-while-revalidate=60",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "X-KMA-Radar-Time": tm,
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
