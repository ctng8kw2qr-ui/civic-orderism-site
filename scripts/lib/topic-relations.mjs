export function isEligiblePrimaryTopicArticle(article) {
  return Boolean(
    article &&
    article.status === "published" &&
    article.published !== false &&
    article.draft !== true &&
    article.archived !== true &&
    article.needsReview !== true,
  );
}

export function resolveTopicRelations({
  primaryTopic,
  relatedTopics = [],
  validTopicSlugs,
}) {
  const valid = (slug) => typeof slug === "string" && validTopicSlugs.has(slug);
  const normalizedPrimary = valid(primaryTopic) ? primaryTopic : null;
  const normalizedRelated = [...new Set(relatedTopics)]
    .filter(valid)
    .filter((slug) => slug !== normalizedPrimary);

  return {
    primaryTopic: normalizedPrimary,
    relatedTopics: normalizedRelated,
    topics: [normalizedPrimary, ...normalizedRelated].filter(Boolean),
  };
}

export function getPrimaryTopicArticles(articles, topicSlug) {
  return articles
    .filter(isEligiblePrimaryTopicArticle)
    .filter((article) => article.primaryTopic === topicSlug)
    .sort(
      (a, b) =>
        String(b.date ?? "").localeCompare(String(a.date ?? "")) ||
        String(a.title ?? "").localeCompare(String(b.title ?? ""), "zh-CN"),
    );
}
