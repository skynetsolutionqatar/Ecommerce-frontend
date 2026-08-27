/** Invoice header layout helpers */

export const HDR = {
  pageW: 595,
  height: 96,
  /** Left zone for logo (~white area in banner bg) */
  logoLeft: 22,
  logoWidth: 165,
  logoHeight: 58,
  /** Company text on navy (right of curve) */
  contentLeft: 210,
  contentRight: 128,
  contactRight: 14,
  contactWidth: 118,
};

export function splitCompanyTitle(nameEn: string): [string, string] {
  const trimmed = nameEn.trim();
  if (trimmed.endsWith(" Qatar")) {
    return [trimmed.slice(0, -6), "Qatar"];
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length > 1) {
    return [parts.slice(0, -1).join(" "), parts.at(-1) ?? ""];
  }
  return [trimmed, ""];
}

export function splitTagline(tagline: string): [string, string | null] {
  const upper = tagline.toUpperCase().replace(/\s·\s/g, "  •  ");
  if (upper.includes("IT HARDWARE")) {
    return [upper.replace(" IT HARDWARE", "  •  IT HARD-"), "WARE"];
  }
  return [upper, null];
}
