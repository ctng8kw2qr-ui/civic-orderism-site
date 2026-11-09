import { QuartzPluginData } from "../plugins/vfile";
import { isArticleSlug } from "./articlePage";

export function publicationTime(page: QuartzPluginData): number {
  const raw = page.frontmatter?.date ?? page.frontmatter?.published;
  const time = raw ? new Date(String(raw)).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

/** Existing Quartz content only. Explicit editorial selection wins; ties are stable. */
export function selectHomepageResearch(files: QuartzPluginData[], count = 2) {
  const published = files
    .filter((page) => {
      const fm = page.frontmatter;
      return (
        isArticleSlug(page.slug ?? "") &&
        Boolean(fm?.title) &&
        (!fm?.status || fm.status === "published") &&
        fm?.draft !== true &&
        fm?.draft !== "true" &&
        fm?.corePoliticalStatement !== true &&
        fm?.category !== "核心政治总论"
      );
    })
    .sort(
      (a, b) =>
        publicationTime(b) - publicationTime(a) ||
        (a.slug ?? "").localeCompare(b.slug ?? ""),
    );
  const marked = published.filter(
    (p) =>
      p.frontmatter?.homepageLead === true ||
      p.frontmatter?.homepageLead === "true",
  );
  const lead = marked[0] ?? published[0];
  return {
    lead,
    secondary: published.filter((p) => p.slug !== lead?.slug).slice(0, count),
    markedCount: marked.length,
  };
}
