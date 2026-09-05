function toAnchorId(text, index) {
  const base = String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${base || "chapter"}-${index + 1}`;
}

export function prepareArticleContentData(article) {
  const bodyBlocks = Array.isArray(article?.body) ? article.body : [];

  const chapterItems = bodyBlocks.reduce((acc, block, blockIndex) => {
    if (!block || typeof block !== "object") return acc;

    if (
      block.type === "h1" ||
      block.type === "h2" ||
      block.type === "h3" ||
      block.type === "h4"
    ) {
      const title = String(block.text || "").trim();
      if (!title) return acc;

      acc.push({
        blockIndex,
        title,
        id: toAnchorId(title, acc.length),
      });
    }

    return acc;
  }, []);

  const chapterByBlockIndex = new Map(
    chapterItems.map((chapter) => [chapter.blockIndex, chapter]),
  );

  const formattedPublishedAt = article?.created_at
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(article.created_at))
    : "";

  return {
    bodyBlocks,
    chapterItems,
    chapterByBlockIndex,
    formattedPublishedAt,
  };
}
