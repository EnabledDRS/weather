const DEFAULT_TIMEOUT_MS = 12_000;

export class KmaRequestError extends Error {
  status: number;

  constructor(status: number) {
    super(`KMA request failed with ${status}`);
    this.name = "KmaRequestError";
    this.status = status;
  }
}

export async function fetchKma(
  endpoint: string,
  params: URLSearchParams,
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${endpoint}?${params}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new KmaRequestError(response.status);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
