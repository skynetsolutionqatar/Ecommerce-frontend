/** Read `_id` from a MongoDB field that may be a string or populated object. */
export function resolveRefId(field?: string | { _id: string } | null): string {
  if (!field) return "";
  if (typeof field === "object") return field._id;
  return field;
}

/** Read `name` from a populated reference, or return the raw string / fallback. */
export function resolveRefName(
  field?: string | { name: string } | null,
  fallback = "—"
): string {
  if (!field) return fallback;
  if (typeof field === "object") return field.name;
  return field;
}
