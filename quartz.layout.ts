import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const publicExplorerOptions = {
  filterFn: (node: any) =>
    node.slugSegment !== "tags" &&
    !node.slugSegment.startsWith("article_"),
  mapFn: (node: any) => {
    if (node.slugSegment === "start-here") node.displayName = "从这里开始"
    if (node.slugSegment === "introduction-manual") node.displayName = "介绍手册"
    if (node.slugSegment === "organization-manual") node.displayName = "组织手册"
    if (node.slugSegment === "theory") node.displayName = "旧秩序失效"
    if (node.slugSegment === "china") node.displayName = "解析中共"
    if (node.slugSegment === "china-stage") node.displayName = "中国阶段判断"
    if (node.slugSegment === "civic-orderism") node.displayName = "公民秩序主义"
    if (node.slugSegment === "institution") node.displayName = "制度机制"
    if (node.slugSegment === "articles.md") node.displayName = "阅读地图"
  },
  sortFn: (a: any, b: any) => {
    const order = [
      "index.md",
      "introduction-manual",
      "organization-manual",
      "theory",
      "china",
      "china-stage",
      "civic-orderism",
      "institution",
      "articles.md",
      "start-here",
    ]
    const ai = order.indexOf(a.slugSegment)
    const bi = order.indexOf(b.slugSegment)
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    }

    const getDateTime = (node: any) => {
      const rawDate = node.data?.date
      if (!rawDate) return undefined
      const value = rawDate instanceof Date ? rawDate : new Date(rawDate)
      const time = value.getTime()
      return Number.isNaN(time) ? undefined : time
    }

    if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
      const aTime = getDateTime(a)
      const bTime = getDateTime(b)
      if (aTime !== undefined || bTime !== undefined) {
        if (aTime === undefined) return 1
        if (bTime === undefined) return -1
        if (aTime !== bTime) return bTime - aTime
      }

      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }

    return !a.isFolder && b.isFolder ? 1 : -1
  },
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
      component: Component.ManualModals(),
      condition: (page) => page.fileData.slug === "index",
    }),
  ],
  footer: Component.Footer({
    links: {
      "Civic Orderism": "https://civicorderism.com",
      "X: @CivicOrderism": "https://x.com/CivicOrderism",
      "citizenorder@proton.me": "mailto:citizenorder@proton.me",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ContentMeta(),
    Component.TagList(),
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
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ContentMeta()],
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
}
