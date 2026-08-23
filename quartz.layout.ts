import { PageLayout, SharedLayout } from "./quartz/cfg";
import * as Component from "./quartz/components";
import { QuartzComponentProps } from "./quartz/components/types";
import { isArticleSlug } from "./quartz/util/articlePage";

const isArticleContentPage = (page: QuartzComponentProps) => {
  return isArticleSlug(page.fileData.slug ?? "");
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
    Component.ArticleEndingCta(),
    Component.ConditionalRender({
      component: Component.ManualModals(),
      condition: () => false,
    }),
    Component.ConditionalRender({
      component: Component.ArticleAttribution(),
      condition: isArticleContentPage,
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
      component: Component.Breadcrumbs({ rootName: "首页", spacerSymbol: "/" }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleHeader(),
      condition: isArticleContentPage,
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: shouldShowContentMeta,
    }),
    Component.TagList(),
    Component.ArticleSeriesNavigation(),
    Component.ArticleCoreJudgmentCard(),
    Component.ConditionalRender({
      component: Component.TableOfContents(),
      condition: isArticleContentPage,
    }),
  ],
  left: [],
  right: [
    Component.ConditionalRender({
      component: Component.DesktopOnly(Component.TableOfContents()),
      condition: isArticleContentPage,
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
