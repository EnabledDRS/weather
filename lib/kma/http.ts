const DEFAULT_TIMEOUT_MS = 12_000;

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
      throw new Error(`KMA request failed with ${response.status}`);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
