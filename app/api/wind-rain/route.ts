import { NextResponse } from "next/server";
import { KMA_ENDPOINTS } from "../../../lib/kma/config";
import { fetchKma } from "../../../lib/kma/http";
import { radarTimestamp } from "../../../lib/kma/radar";
import {
  radarKstToGk2aUtc,
  snapGk2aUtcToRepositoryFrame,
} from "../../../lib/kma/gk2a";

const IMAGE_TIMESTAMP = /^\d{12}$/;

export async function GET(request: Request) {
  try {
    const requestedTime = new URL(request.url).searchParams.get("date");
    if (requestedTime && !IMAGE_TIMESTAMP.test(requestedTime)) {
      return new NextResponse(null, { status: 400 });
    }

    const radarTime = requestedTime || radarTimestamp();
    const date = snapGk2aUtcToRepositoryFrame(
      radarKstToGk2aUtc(radarTime),
    );
    const imageUrl =
      `${KMA_ENDPOINTS.satelliteImageRepository}/` +
      `gk2a_ami_le1b_rgb-cs_ko005lc_${date}.thn.jpg`;
    const response = await fetchKma(
      imageUrl,
      new URLSearchParams(),
      18_000,
    );
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return new NextResponse(null, { status: 502 });
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": requestedTime
          ? "public, max-age=86400, immutable"
          : "public, max-age=240, stale-while-revalidate=60",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "X-KMA-Satellite-Time": date,
        "X-KMA-Radar-Time": radarTime,
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
