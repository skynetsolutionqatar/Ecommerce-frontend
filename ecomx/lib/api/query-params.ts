/** Serialize query objects for GET requests (booleans → "true"/"false", omit empty). */
export function toQueryParams(
  params?: Record<string, unknown>
): Record<string, string | number> | undefined {
  if (!params) return undefined;

  const out: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    if (typeof value === "boolean") {
      out[key] = value ? "true" : "false";
    } else if (Array.isArray(value)) {
      out[key] = value.join(",");
    } else {
      out[key] = value as string | number;
    }
  }

  return Object.keys(out).length ? out : undefined;
}
