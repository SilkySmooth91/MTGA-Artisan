function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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
  const safeSlug = slugify(safeTitle);

  return {
    id: safeId,
    title: safeTitle,
    excerpt: safeExcerpt,
    imageUrl: safeImageUrl,
    author: safeAuthor,
    category: safeCategory,
    href: safeId ? `/news/${safeSlug}-${safeId}` : `/news/${safeSlug}`,
  };
}