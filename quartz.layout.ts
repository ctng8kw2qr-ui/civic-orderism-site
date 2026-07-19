import { PageLayout, SharedLayout } from "./quartz/cfg";
import * as Component from "./quartz/components";
import { QuartzComponentProps } from "./quartz/components/types";

const articlePrefixes = [
  "theory/",
  "china/",
  "china-stage/",
  "civic-orderism/",
  "institution/",
];

const isArticleContentPage = (page: QuartzComponentProps) => {
  const slug = page.fileData.slug ?? "";
  if (slug === "index" || slug === "articles" || slug.endsWith("/index")) {
    return false;
  }
  return articlePrefixes.some((prefix) => slug.startsWith(prefix));
};

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.PrimaryNavigation()],
  afterBody: [
    Component.ArticleSeriesNavigation(),
    Component.ArticleKnowledgeContext(),
    Component.ArticleContinueReading(),
    Component.ArticleEndingCta(),
    Component.ConditionalRender({
      component: Component.ManualModals(),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleAttribution(),
      condition: isArticleContentPage,
    }),
  ],
  footer: Component.Footer({
    copyright: "© 2026 Citizen Orderism / 公民秩序主义",
    links: {
      "Official Publication · civicorderism.com": "https://civicorderism.com/",
      开始阅读: "/start",
      专题: "/topics",
      核心概念: "/concepts",
      版权说明: "/copyright",
    },
  }),
};

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleReadingProgress(),
    Component.ConditionalRender({
      component: Component.Breadcrumbs({ rootName: "首页", spacerSymbol: "/" }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.TagList(),
    Component.ArticleSeriesNavigation(),
    Component.ArticleCoreJudgmentCard(),
    Component.ConditionalRender({
      component: Component.TableOfContents(),
      condition: isArticleContentPage,
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.KnowledgeSidebar(),
  ],
  right: [],
};

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({ rootName: "首页", spacerSymbol: "/" }),
    Component.ContentMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.KnowledgeSidebar(),
  ],
  right: [],
};
