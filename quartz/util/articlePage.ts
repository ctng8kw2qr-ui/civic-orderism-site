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

export function getContentArticleClasses(
  slug = "",
  cssclasses: string[] = [],
): string[] {
  return [
    "popover-hint",
    ...(isArticleSlug(slug) ? ["article-content"] : []),
    ...cssclasses,
  ];
}
