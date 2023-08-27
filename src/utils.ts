export function toQueryParams(x: unknown): string {
  if (!x) return "";
  return Object.entries(x)
    .map(([k, v]) => k && v && `${k}=${encodeURIComponent(v)}`)
    .filter(Boolean)
    .join("&");
}
