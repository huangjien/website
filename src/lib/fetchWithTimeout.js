export async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function parseErrorResponse(response) {
  try {
    const text = await response.text();
    if (!text) {
      return `Request failed with status ${response.status}`;
    }
    try {
      const json = JSON.parse(text);
      return json?.message || json?.error || text;
    } catch {
      return text;
    }
  } catch {
    return `Request failed with status ${response.status}`;
  }
}
