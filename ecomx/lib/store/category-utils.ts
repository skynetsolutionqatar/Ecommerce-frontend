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

/** Id of a category's parent, or undefined for a top-level category. */
export function categoryParentId(category: ApiCategory): string | undefined {
  const parent = category.parent;
  if (!parent) return undefined;
  if (typeof parent === "string") return parent;
  if (typeof parent === "object" && "_id" in parent) return parent._id;
  return undefined;
}

export function childCategories(categories: ApiCategory[], parentId: string): ApiCategory[] {
  return categories.filter((c) => categoryParentId(c) === parentId);
}

export function rootCategories(categories: ApiCategory[]): ApiCategory[] {
  return categories.filter((c) => !categoryParentId(c));
}

/**
 * Departments for the mobile categories rail.
 * The store query returns child categories (`isParent: false`), so a parent-only
 * list is empty and the pane never selects anything.
 */
export function departmentCategories(categories: ApiCategory[]): ApiCategory[] {
  const roots = rootCategories(categories);
  return roots.length > 0 ? roots : categories;
}

export function descendantCategoryIds(categories: ApiCategory[], rootId: string): string[] {
  const out: string[] = [];
  const queue = [rootId];
  const seen = new Set(queue);
  while (queue.length) {
    const current = queue.shift()!;
    for (const category of categories) {
      if (categoryParentId(category) === current && !seen.has(category._id)) {
        seen.add(category._id);
        queue.push(category._id);
        out.push(category._id);
      }
    }
  }
  return out;
}

export function categoryScopeIds(categories: ApiCategory[], rootId: string): string[] {
  return [rootId, ...descendantCategoryIds(categories, rootId)];
}
