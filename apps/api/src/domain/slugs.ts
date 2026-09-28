/** Slugs that are pages of their own: /recipes/new is the New recipe form. */
const reservedSlugs = new Set(['new']);

/**
 * A recipe's address from its name: "Shepherd's Pie" gives "shepherds-pie". Lowercase, without
 * accents or apostrophes, with anything else between words as one dash. "recipe" if nothing's left.
 */
export function slugify(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'recipe';
}

/** A slug for the name that isn't taken or reserved: "tomato-soup", then "tomato-soup-2"… */
export function uniqueSlug(name: string, taken: ReadonlySet<string>): string {
  const base = slugify(name);
  const isFree = (slug: string) => !taken.has(slug) && !reservedSlugs.has(slug);
  if (isFree(base)) return base;

  let suffix = 2;
  while (!isFree(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
