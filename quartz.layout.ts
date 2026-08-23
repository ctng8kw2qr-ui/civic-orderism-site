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
  "organization-manual",
  "about",
]);

const shouldShowContentMeta = (page: QuartzComponentProps) => {
  const slug = (page.fileData.slug ?? "").replace(/\/index$/, "");
  return (
    slug !== "index" &&
    slug !== "articles" &&
    slug !== "articles/all" &&
    !institutionalPageSlugs.has(slug)
  );
};

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.PrimaryNavigation()],
  afterBody: [
    Component.ArticleSeriesNavigation(),
    Component.ArticleContinueReading(),
    Component.ArticleKnowledgeContext(),
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
    copyright: "© 2026 Civic Orderism / 公民秩序主义",
    links: {
      "5分钟了解": "/start-here",
      阅读地图: "/articles",
      董事会筹备: "/preparation",
      核心路线: "/civic-orderism/peaceful-state-transition",
      参与方式: "/participate",
      关于: "/about",
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
