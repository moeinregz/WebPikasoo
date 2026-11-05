/** Optional stock photo (Pexels, free key in PEXELS_API_KEY); null = keep the placeholder.
 *  `avoid` skips photos already used elsewhere, so one article doesn't repeat a picture. */
export async function findPhoto(query: string, avoid?: Set<string>): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key || !query) return null;
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?per_page=8&orientation=landscape&query=${encodeURIComponent(query)}`, {
      headers: { Authorization: key },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { photos?: { src?: { large?: string } }[] };
    const photos = (data.photos ?? [])
      .map((p) => p.src?.large)
      .filter((u): u is string => !!u && !avoid?.has(u));
    return photos.length ? photos[Math.floor(Math.random() * Math.min(3, photos.length))] : null;
  } catch {
    return null;
  }
}

export const hasStockPhotoKey = () => !!process.env.PEXELS_API_KEY;
