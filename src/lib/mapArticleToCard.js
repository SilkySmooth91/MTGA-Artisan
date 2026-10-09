function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function truncateSlug(slug, { maxWords = 4, maxLength = 50 } = {}) {
  let result = slug.split("-").filter(Boolean).slice(0, maxWords).join("-");

  if (result.length > maxLength) {
    const truncated = result.slice(0, maxLength);
    const lastDash = truncated.lastIndexOf("-");
    result = lastDash > 0 ? truncated.slice(0, lastDash) : truncated;
  }

  return result;
}

export function mapArticleToCard(article) {
  const safeTitle = article?.title?.trim() || "Titolo articolo";
  const safeExcerpt =
    article?.excerpt?.trim() ||
    "Breve estratto dell'articolo per dare contesto e invogliare alla lettura.";
  const safeImageUrl =
    article?.img?.trim() ||
    "https://images.unsplash.com/photo-1511512578047-dfb367046420";
  const safeAuthor = article?.author?.trim() || "Redazione MTGA Artisan";
  const safeCategory = article?.category?.trim() || "General";
  const safeId = article?.id || "";
  // Prefer the DB-stored slug; fall back to a title+id slug until it's populated.
  const titleSlug = truncateSlug(slugify(safeTitle));
  const safeSlug =
    article?.slug?.trim() ||
    (safeId ? `${titleSlug}-${safeId}` : titleSlug);

  return {
    id: safeId,
    slug: safeSlug,
    title: safeTitle,
    excerpt: safeExcerpt,
    imageUrl: safeImageUrl,
    author: safeAuthor,
    category: safeCategory,
    href: `/news/${safeSlug}`,
  };
}