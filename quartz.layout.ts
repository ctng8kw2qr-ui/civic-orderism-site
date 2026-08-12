import { PageLayout, SharedLayout } from "./quartz/cfg";
import * as Component from "./quartz/components";
import { QuartzComponentProps } from "./quartz/components/types";
import { isArticleSlug } from "./quartz/util/articlePage";

const isArticleContentPage = (page: QuartzComponentProps) => {
  return isArticleSlug(page.fileData.slug ?? "");
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
    copyright: "© 2026 Civic Orderism / 公民秩序主义",
    links: {
      开始阅读: "/start",
      董事会筹备: "/preparation",
      核心路线: "/civic-orderism/peaceful-state-transition",
      参与: "/participate",
      专题: "/topics",
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
      condition: (page) =>
        page.fileData.slug !== "index" &&
        page.fileData.slug !== "articles" &&
        page.fileData.slug !== "articles/all",
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
      condition: (page) =>
        page.fileData.slug !== "articles" &&
        page.fileData.slug !== "articles/all",
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
