import { resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types"
import { Date, getDate } from "./Date"
import style from "./styles/articleReadingEnhancements.scss"

// @ts-ignore
import script from "./scripts/articleReadingEnhancements.inline"

const ARTICLE_PREFIXES = [
  "theory/",
  "china/",
  "china-stage/",
  "civic-orderism/",
  "institution/",
]

function isArticlePage(fileData: QuartzPluginData) {
  const slug = fileData.slug ?? ""
  if (slug === "index" || slug.endsWith("/index")) return false
  return ARTICLE_PREFIXES.some((prefix) => slug.startsWith(prefix))
}

function asStringArray(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    )
  }
  if (typeof value === "string" && value.trim() !== "") return [value]
  return []
}

function getArticleSummary(file: QuartzPluginData) {
  const raw =
    file.frontmatter?.summary ??
    file.frontmatter?.description ??
    file.description ??
    ""
  const summary = String(raw).replace(/\s+/g, " ").trim()
  if (summary.length <= 66) return summary
  return `${summary.slice(0, 66)}...`
}

function getSeries(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() !== "") return value.trim()
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name
    if (typeof name === "string" && name.trim() !== "") return name.trim()
  }
  return undefined
}

function articleFiles(allFiles: QuartzPluginData[]) {
  return allFiles.filter((file) => file.slug && isArticlePage(file))
}

function sameCategory(a: QuartzPluginData, b: QuartzPluginData) {
  return Boolean(
    a.frontmatter?.category &&
    a.frontmatter.category === b.frontmatter?.category,
  )
}

function sharedTagCount(a: QuartzPluginData, b: QuartzPluginData) {
  const aTags = new Set(asStringArray(a.frontmatter?.tags))
  return asStringArray(b.frontmatter?.tags).filter((tag) => aTags.has(tag))
    .length
}

function byOldestFirst(a: QuartzPluginData, b: QuartzPluginData) {
  const aTime =
    a.dates?.published?.getTime() ?? a.dates?.created?.getTime() ?? 0
  const bTime =
    b.dates?.published?.getTime() ?? b.dates?.created?.getTime() ?? 0
  if (aTime !== bTime) return aTime - bTime
  return (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "")
}

function byRecommendationScore(
  current: QuartzPluginData,
  currentSeries?: string,
) {
  return (a: QuartzPluginData, b: QuartzPluginData) => {
    const score = (file: QuartzPluginData) => {
      let total = 0
      if (
        currentSeries &&
        getSeries(file.frontmatter?.series) === currentSeries
      )
        total += 100
      if (sameCategory(current, file)) total += 30
      total += sharedTagCount(current, file) * 12
      const time =
        file.dates?.published?.getTime() ?? file.dates?.created?.getTime() ?? 0
      return total * 10000000000000 + time
    }
    return score(b) - score(a)
  }
}

export const CoreJudgmentCard: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const judgments = asStringArray(
    fileData.frontmatter?.key_points ??
      fileData.frontmatter?.keyPoints ??
      fileData.frontmatter?.coreJudgments ??
      fileData.frontmatter?.core_judgments,
  ).slice(0, 5)

  if (!isArticlePage(fileData) || judgments.length === 0) return null

  return (
    <section class="article-core-judgments" aria-label="本文核心判断">
      <div class="article-core-judgments__label">本文核心判断</div>
      <ol>
        {judgments.map((judgment) => (
          <li>{judgment}</li>
        ))}
      </ol>
    </section>
  )
}

export const SeriesNavigation: QuartzComponent = ({
  fileData,
  allFiles,
  displayClass,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null

  const currentSeries = getSeries(fileData.frontmatter?.series)
  if (!currentSeries) return null

  const pages = articleFiles(allFiles)
    .filter((file) => getSeries(file.frontmatter?.series) === currentSeries)
    .sort(byOldestFirst)

  if (pages.length < 2) return null

  const currentIndex = pages.findIndex((file) => file.slug === fileData.slug)
  if (currentIndex === -1) return null

  const previous = pages[currentIndex - 1]
  const next = pages[currentIndex + 1]
  const seriesIndex = pages.find((file) => file.slug?.endsWith("/index"))

  return (
    <nav
      class={`article-series-nav ${displayClass ?? ""}`}
      aria-label="系列文章导航"
    >
      <div class="article-series-nav__name">系列：{currentSeries}</div>
      <div class="article-series-nav__links">
        {previous ? (
          <a
            href={resolveRelative(fileData.slug!, previous.slug!)}
            class="internal"
          >
            上一篇：{previous.frontmatter?.title}
          </a>
        ) : (
          <span>上一篇：无</span>
        )}
        {seriesIndex && seriesIndex.slug !== fileData.slug ? (
          <a
            href={resolveRelative(fileData.slug!, seriesIndex.slug!)}
            class="internal"
          >
            系列目录
          </a>
        ) : null}
        {next ? (
          <a
            href={resolveRelative(fileData.slug!, next.slug!)}
            class="internal"
          >
            下一篇：{next.frontmatter?.title}
          </a>
        ) : (
          <span>下一篇：无</span>
        )}
      </div>
    </nav>
  )
}

export const ContinueReading: QuartzComponent = ({
  cfg,
  fileData,
  allFiles,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null

  const currentSeries = getSeries(fileData.frontmatter?.series)
  const recommendations = articleFiles(allFiles)
    .filter((file) => file.slug !== fileData.slug)
    .filter((file) => {
      return (
        (currentSeries &&
          getSeries(file.frontmatter?.series) === currentSeries) ||
        sameCategory(fileData, file) ||
        sharedTagCount(fileData, file) > 0
      )
    })
    .sort(byRecommendationScore(fileData, currentSeries))
    .slice(0, 3)

  if (recommendations.length === 0) return null

  return (
    <section class="article-continue-reading" aria-label="继续阅读">
      <h2>继续阅读</h2>
      <div class="article-continue-reading__grid">
        {recommendations.map((page) => (
          <article class="article-continue-reading__card" data-card="recommendation">
            <h3 class="article-continue-reading__title">
              <a href={resolveRelative(fileData.slug!, page.slug!)}>
                {page.frontmatter?.title}
              </a>
            </h3>
            <p class="article-continue-reading__meta">
              {page.dates ? (
                <Date date={getDate(cfg, page)!} locale={cfg.locale} />
              ) : null}
              {page.frontmatter?.category ? (
                <span>{String(page.frontmatter.category)}</span>
              ) : null}
            </p>
            {getArticleSummary(page) ? (
              <p class="article-continue-reading__summary">
                {getArticleSummary(page)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export const ArticleCta: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null

  return (
    <section class="article-ending-cta" aria-label="文章结尾信息">
      <div>
        <h2>进一步阅读与联系</h2>
        <p>
          如果你希望继续了解公民秩序主义的完整框架，可先阅读介绍手册；严肃交流可通过邮箱联系。
        </p>
      </div>
      <ul class="article-ending-cta__links">
        <li class="article-ending-cta__item">
          <span class="article-ending-cta__label">资料入口</span>
          <span class="article-ending-cta__value">
            <a href="/files/civic-orderism-introduction-manual.pdf">
              阅读 PDF 介绍手册
            </a>
          </span>
        </li>
        <li class="article-ending-cta__item">
          <span class="article-ending-cta__label">主邮箱</span>
          <span class="article-ending-cta__value">
            <a href="mailto:citizenorder@proton.me">
              citizenorder@proton.me
            </a>
          </span>
        </li>
        <li class="article-ending-cta__item">
          <span class="article-ending-cta__label">备用邮箱</span>
          <span class="article-ending-cta__value">
            <a href="mailto:civicorderism@gmail.com">
              civicorderism@gmail.com
            </a>
          </span>
        </li>
      </ul>
    </section>
  )
}

export const ReadingProgress: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null
  return <div class="article-reading-progress" aria-hidden="true" />
}

ReadingProgress.css = style
ReadingProgress.afterDOMLoaded = script
CoreJudgmentCard.css = style
SeriesNavigation.css = style
ContinueReading.css = style
ArticleCta.css = style

export const ArticleCoreJudgmentCard = (() =>
  CoreJudgmentCard) satisfies QuartzComponentConstructor
export const ArticleSeriesNavigation = (() =>
  SeriesNavigation) satisfies QuartzComponentConstructor
export const ArticleContinueReading = (() =>
  ContinueReading) satisfies QuartzComponentConstructor
export const ArticleEndingCta = (() =>
  ArticleCta) satisfies QuartzComponentConstructor
export const ArticleReadingProgress = (() =>
  ReadingProgress) satisfies QuartzComponentConstructor
