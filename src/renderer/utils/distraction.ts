export function extractDomain(url: string | null) {
  if (!url) return null;
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function matchesList(target: string, list: string[]) {
  const lower = target.toLowerCase();
  return list.some((entry) => lower.includes(entry.toLowerCase()));
}
