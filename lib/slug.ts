/** Turns a title (Persian or Latin) into a URL-safe slug for blog post
 *  permalinks (used both to auto-suggest a slug from the title on the
 *  client, and to validate/normalize whatever the admin typed by hand). */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // Persian/Arabic "ي" و "ك" variants -> standard Persian forms, so slugs
    // stay consistent regardless of which keyboard layout typed them.
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    // Anything that isn't a letter (Latin or Persian), digit, or space
    // becomes a space, which then collapses into a single hyphen below.
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[\p{L}\p{N}-]+$/u.test(slug) && slug.length <= 200;
}
