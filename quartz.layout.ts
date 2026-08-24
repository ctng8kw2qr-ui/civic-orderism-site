import { PageLayout, SharedLayout } from "./quartz/cfg";
import * as Component from "./quartz/components";
import { QuartzComponentProps } from "./quartz/components/types";
import { isArticleSlug } from "./quartz/util/articlePage";

const isArticleContentPage = (page: QuartzComponentProps) => {
  return isArticleSlug(page.fileData.slug ?? "");
};

// All formal articles use the approved Institutional Article System.
// The Prototype opt-in (frontmatter.articleType) is now a formal Page Type
// rule: any article page routes into the same institutional shell.
const isInstitutionalArticle = (page: QuartzComponentProps) => {
  return isArticleContentPage(page);
};

const isNotInstitutionalArticle = (page: QuartzComponentProps) => {
  return !isInstitutionalArticle(page);
};

// Institutional template shows a TOC only when the article is long enough.
// Rule: at least 8 H2 headings. Quartz's toc depth is normalized relative
// depth (H2 → 0, H3 → 1), so the threshold counts depth-0 entries.
const institutionalArticleToc = (page: QuartzComponentProps) => {
  if (!isInstitutionalArticle(page)) return false;
  const toc = page.fileData.toc ?? [];
  return toc.filter((entry) => entry.depth === 0).length >= 8;
};

const articleToc = (page: QuartzComponentProps) => {
  if (isInstitutionalArticle(page)) return institutionalArticleToc(page);
  return isArticleContentPage(page);
};

const institutionalPageSlugs = new Set([
  "start-here",
  "preparation",
  "preparation/board",
  "participate",
  "about",
]);

const shouldShowContentMeta = (page: QuartzComponentProps) => {
  const slug = (page.fileData.slug ?? "").replace(/\/index$/, "");
  const isTopicOrConceptPage =
    slug.startsWith("topics/") || slug.startsWith("concepts/");
  return (
    slug !== "index" &&
    slug !== "articles" &&
    slug !== "articles/all" &&
    !institutionalPageSlugs.has(slug) &&
    !landingPageSlugs.has(slug) &&
    !isTopicOrConceptPage
  );
};

const landingPageSlugs = new Set([
  "about",
  "theory",
  "civic-orderism",
  "china",
  "china-future",
  "china-stage",
  "institution",
  "institution-design",
  "topics",
  "concepts",
  "start-here",
  "preparation",
  "participate",
]);

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.PrimaryNavigation()],
  afterBody: [
    Component.ArticleSeriesNavigation(),
    Component.ArticleReadingFooter(),
    Component.ConditionalRender({
      component: Component.ArticleEndingCta(),
      condition: isNotInstitutionalArticle,
    }),
    Component.ConditionalRender({
      component: Component.ManualModals(),
      condition: () => false,
    }),
    Component.ConditionalRender({
      component: Component.ArticleAttribution(),
      condition: (page) =>
        isArticleContentPage(page) && !isInstitutionalArticle(page),
    }),
    Component.Search(),
  ],
  footer: Component.Footer({
    brand: "CIVIC ORDERISM",
    nameZh: "公民秩序主义",
    tagline: "北美非营利法人及首届董事会筹备中",
    navLinks: [
      { label: "关于", href: "/about" },
      { label: "研究", href: "/theory" },
      { label: "政治路线", href: "/civic-orderism" },
      { label: "董事会筹备", href: "/preparation" },
    ],
    contact: {
      email: "civicorderism@gmail.com",
      emailLabel: "civicorderism@gmail.com",
      secondaryEmail: "citizenorder@proton.me",
      secondaryEmailLabel: "citizenorder@proton.me",
      x: "https://x.com/CivicOrderism",
      xLabel: "@CivicOrderism",
      youtube: "https://www.youtube.com/@CivicOrderism",
      youtubeLabel: "Civic Orderism",
    },
    copyright: "© 2026 Civic Orderism",
  }),
};

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.ArticleInstitutionalHeader(),
      condition: isInstitutionalArticle,
    }),
    Component.ConditionalRender({
      component: Component.ArticleInstitutionalCoreJudgment(),
      condition: isInstitutionalArticle,
    }),
    Component.ConditionalRender({
      component: Component.Breadcrumbs({ rootName: "首页", spacerSymbol: "/" }),
      condition: (page) =>
        page.fileData.slug !== "index" && !isInstitutionalArticle(page),
    }),
    Component.ConditionalRender({
      component: Component.ArticleHeader(),
      condition: (page) =>
        isArticleContentPage(page) && !isInstitutionalArticle(page),
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) =>
        shouldShowContentMeta(page) && !isInstitutionalArticle(page),
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: isNotInstitutionalArticle,
    }),
    Component.ArticleSeriesNavigation(),
    Component.ConditionalRender({
      component: Component.ArticleCoreJudgmentCard(),
      condition: isNotInstitutionalArticle,
    }),
    Component.ConditionalRender({
      component: Component.TableOfContents(),
      condition: articleToc,
    }),
  ],
  left: [],
  right: [
    Component.ConditionalRender({
      component: Component.DesktopOnly(Component.TableOfContents()),
      condition: (page) =>
        !isInstitutionalArticle(page) && isArticleContentPage(page),
    }),
  ],
};

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({ rootName: "首页", spacerSymbol: "/" }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: shouldShowContentMeta,
    }),
  ],
  left: [],
  right: [],
};
