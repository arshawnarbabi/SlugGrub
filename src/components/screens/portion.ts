// Owner: Arshawn. UCSC's menus write ladled portions as "ozl" (ounces by ladle, e.g. "6 ozl" of soup); shown as fluid ounces so it
// doesn't read as a typo. Everything else is shown as the site writes it.
export const portionText = (p?: string | null) => (p ? p.replace(/(\d)\s*ozl\b/gi, "$1 fl oz") : p ?? undefined);
