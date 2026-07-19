import { PageLayout, SharedLayout } from "./quartz/cfg";
import * as Component from "./quartz/components";
import { QuartzComponentProps } from "./quartz/components/types";
import { FileTrieNode } from "./quartz/util/fileTrie";

const publicExplorerOptions = {
  filterFn: (node: FileTrieNode) =>
    node.slugSegment !== "tags" && !node.slugSegment.startsWith("article_"),
  mapFn: (node: FileTrieNode) => {
    if (node.slugSegment === "start-here") node.displayName = "从这里开始";
    if (node.slugSegment === "start.md") node.displayName = "开始阅读";
    if (node.slugSegment === "introduction-manual")
      node.displayName = "介绍手册";
    if (node.slugSegment === "organization-manual")
      node.displayName = "组织手册";
    if (node.slugSegment === "theory") node.displayName = "旧秩序失效";
    if (node.slugSegment === "china") node.displayName = "解析中共";
    if (node.slugSegment === "china-stage") node.displayName = "中国阶段判断";
    if (node.slugSegment === "china-future") node.displayName = "中国未来";
    if (node.slugSegment === "civic-orderism")
      node.displayName = "公民秩序主义";
    if (node.slugSegment === "institution") node.displayName = "制度机制";
    if (node.slugSegment === "institution-design")
      node.displayName = "制度设计";
    if (node.slugSegment === "topics") node.displayName = "专题";
    if (node.slugSegment === "concepts") node.displayName = "核心概念";
    if (node.slugSegment === "about.md") node.displayName = "关于";
    if (node.slugSegment === "articles.md") node.displayName = "阅读地图";
    if (node.slugSegment === "copyright") node.displayName = "版权说明";
  },
  sortFn: (a: FileTrieNode, b: FileTrieNode) => {
    const order = [
      "index.md",
      "introduction-manual",
      "organization-manual",
      "china",
      "china-future",
      "civic-orderism",
      "institution-design",
      "topics",
      "concepts",
      "start.md",
      "about.md",
      "articles.md",
      "theory",
      "china-stage",
      "institution",
      "copyright",
      "start-here",
    ];
    const ai = order.indexOf(a.slugSegment);
    const bi = order.indexOf(b.slugSegment);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }

    if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
      const aRawDate = a.data?.date;
      const bRawDate = b.data?.date;
      const aCandidate = aRawDate
        ? (aRawDate instanceof Date ? aRawDate : new Date(aRawDate)).getTime()
        : undefined;
      const bCandidate = bRawDate
        ? (bRawDate instanceof Date ? bRawDate : new Date(bRawDate)).getTime()
        : undefined;
      const aTime =
        aCandidate !== undefined && !Number.isNaN(aCandidate)
          ? aCandidate
          : undefined;
      const bTime =
        bCandidate !== undefined && !Number.isNaN(bCandidate)
          ? bCandidate
          : undefined;
      if (aTime !== undefined || bTime !== undefined) {
        if (aTime === undefined) return 1;
        if (bTime === undefined) return -1;
        if (aTime !== bTime) return bTime - aTime;
      }

      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }

    return !a.isFolder && b.isFolder ? 1 : -1;
  },
};

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
    Component.ContentMeta(),
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
    Component.Explorer(publicExplorerOptions),
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
    Component.Explorer(publicExplorerOptions),
  ],
  right: [],
};
