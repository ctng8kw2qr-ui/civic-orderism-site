const articlePrefixes = [
  "theory/",
  "china/",
  "china-stage/",
  "civic-orderism/",
  "institution/",
];

export function isArticleSlug(slug = ""): boolean {
  if (slug === "index" || slug === "articles" || slug.endsWith("/index")) {
    return false;
  }

  return articlePrefixes.some((prefix) => slug.startsWith(prefix));
}
