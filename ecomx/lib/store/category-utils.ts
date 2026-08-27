import type { ApiCategory } from "@/types/category.types";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

function norm(value: string): string {
  return value.trim().toLowerCase();
}

/** Resolve a category Mongo id from id, slug, name, or alias labels. */
export function resolveCategoryId(
  categories: ApiCategory[],
  labelOrId: string,
  aliases: string[] = []
): string | undefined {
  const raw = labelOrId.trim();
  if (!raw) return undefined;

  if (OBJECT_ID_RE.test(raw)) {
    const byId = categories.find((c) => c._id === raw);
    if (byId) return byId._id;
  }

  const labels = [raw, ...aliases].map(norm).filter(Boolean);

  for (const label of labels) {
    const slugHit = categories.find((c) => norm(c.slug) === label);
    if (slugHit) return slugHit._id;

    const nameHit = categories.find((c) => norm(c.name) === label);
    if (nameHit) return nameHit._id;
  }

  for (const label of labels) {
    const partial = categories.find(
      (c) =>
        norm(c.name).includes(label) ||
        label.includes(norm(c.name)) ||
        norm(c.slug).includes(label.replace(/\s+/g, "-"))
    );
    if (partial) return partial._id;
  }

  return undefined;
}
