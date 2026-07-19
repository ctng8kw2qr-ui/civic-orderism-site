import { resolveRelative } from "../util/path";
import { QuartzPluginData } from "../plugins/vfile";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import { Date, getDate } from "./Date";
import style from "./styles/articleReadingEnhancements.scss";
import migrationMap from "../../content-migration-map.json";
import topicsConfig from "../../data/topics.config.json";
import conceptsConfig from "../../data/concepts.config.json";
import sectionsConfig from "../../data/sections.config.json";

// @ts-ignore
import script from "./scripts/articleReadingEnhancements.inline";

const ARTICLE_PREFIXES = [
  "theory/",
  "china/",
  "china-stage/",
  "civic-orderism/",
  "institution/",
];

type MigrationEntry = (typeof migrationMap)[number];
const migrationBySlug = new Map<string, MigrationEntry>(
  migrationMap.map((entry) => [entry.slug, entry]),
);
const topicBySlug = new Map(
  topicsConfig
    .filter((topic) => topic.status === "published")
    .map((topic) => [topic.slug, topic]),
);
const conceptBySlug = new Map(
  conceptsConfig
    .filter((concept) => concept.status === "published")
    .map((concept) => [concept.slug, concept]),
);
const sectionByName = new Map(
  sectionsConfig.map((section) => [section.name, section]),
);

function knowledgeFor(file: QuartzPluginData) {
  return migrationBySlug.get(file.slug ?? "");
}

function isArticlePage(fileData: QuartzPluginData) {
  const slug = fileData.slug ?? "";
  if (slug === "index" || slug.endsWith("/index")) return false;
  return ARTICLE_PREFIXES.some((prefix) => slug.startsWith(prefix));
}

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    );
  }
  if (typeof value === "string" && value.trim() !== "") return [value];
  return [];
}

function getArticleSummary(file: QuartzPluginData) {
  const raw =
    file.frontmatter?.summary ??
    file.frontmatter?.description ??
    file.description ??
    "";
  const summary = String(raw).replace(/\s+/g, " ").trim();
  if (summary.length <= 66) return summary;
  return `${summary.slice(0, 66)}...`;
}

function getSeries(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    if (typeof name === "string" && name.trim() !== "") return name.trim();
  }
  return undefined;
}

function articleFiles(allFiles: QuartzPluginData[]) {
  return allFiles.filter((file) => file.slug && isArticlePage(file));
}

function sameSection(a: QuartzPluginData, b: QuartzPluginData) {
  const aKnowledge = knowledgeFor(a);
  const bKnowledge = knowledgeFor(b);
  if (aKnowledge?.section && bKnowledge?.section) {
    return aKnowledge.section === bKnowledge.section;
  }
  return Boolean(
    a.frontmatter?.category &&
    a.frontmatter.category === b.frontmatter?.category,
  );
}

function sharedTopicCount(a: QuartzPluginData, b: QuartzPluginData) {
  const aKnowledge = knowledgeFor(a);
  const bKnowledge = knowledgeFor(b);
  if (!aKnowledge || !bKnowledge) return 0;
  const aTopics = new Set(
    aKnowledge.topics.filter((topic) => topicBySlug.has(topic)),
  );
  return bKnowledge.topics.filter((topic) => aTopics.has(topic)).length;
}

function sharedConceptCount(a: QuartzPluginData, b: QuartzPluginData) {
  const aKnowledge = knowledgeFor(a);
  const bKnowledge = knowledgeFor(b);
  if (!aKnowledge || !bKnowledge) return 0;
  const aConcepts = new Set(
    aKnowledge.concepts.filter((concept) => conceptBySlug.has(concept)),
  );
  return bKnowledge.concepts.filter((concept) => aConcepts.has(concept)).length;
}

function isEligibleRecommendation(file: QuartzPluginData) {
  const knowledge = knowledgeFor(file);
  return Boolean(
    knowledge &&
    knowledge.status === "published" &&
    !knowledge.needsReview &&
    file.frontmatter?.status !== "draft" &&
    file.frontmatter?.status !== "archived" &&
    file.frontmatter?.published !== false,
  );
}

function byOldestFirst(a: QuartzPluginData, b: QuartzPluginData) {
  const aTime =
    a.dates?.published?.getTime() ?? a.dates?.created?.getTime() ?? 0;
  const bTime =
    b.dates?.published?.getTime() ?? b.dates?.created?.getTime() ?? 0;
  if (aTime !== bTime) return aTime - bTime;
  return (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "");
}

function byRecommendationScore(
  current: QuartzPluginData,
  currentSeries?: string,
) {
  return (a: QuartzPluginData, b: QuartzPluginData) => {
    const score = (file: QuartzPluginData) => {
      let total = 0;
      if (
        currentSeries &&
        getSeries(file.frontmatter?.series) === currentSeries
      )
        total += 1;
      total += sharedTopicCount(current, file) * 1000;
      total += sharedConceptCount(current, file) * 100;
      if (sameSection(current, file)) total += 10;
      if (knowledgeFor(file)?.recommended) total += 1;
      const time =
        file.dates?.published?.getTime() ?? file.dates?.created?.getTime() ?? 0;
      return total * 10000000000000 + time;
    };
    return score(b) - score(a);
  };
}

export const KnowledgeContext: QuartzComponent = ({
  fileData,
  allFiles,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null;
  const knowledge = knowledgeFor(fileData);
  if (!knowledge) return null;

  const section = sectionByName.get(knowledge.section);
  const topics = knowledge.topics
    .map((slug) => topicBySlug.get(slug))
    .filter(Boolean);
  const concepts = knowledge.concepts
    .map((slug) => conceptBySlug.get(slug))
    .filter(Boolean);
  const primaryTopic = knowledge.topics[0];
  const readingSequence = articleFiles(allFiles)
    .filter(isEligibleRecommendation)
    .filter(
      (file) =>
        primaryTopic !== undefined &&
        topicBySlug.has(primaryTopic) &&
        knowledgeFor(file)?.topics.includes(primaryTopic),
    )
    .sort((a, b) => {
      const aOrder = knowledgeFor(a)?.readingOrder ?? 999;
      const bOrder = knowledgeFor(b)?.readingOrder ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return byOldestFirst(a, b);
    });
  const currentIndex = readingSequence.findIndex(
    (file) => file.slug === fileData.slug,
  );
  const previous =
    currentIndex > 0 ? readingSequence[currentIndex - 1] : undefined;
  const next =
    currentIndex >= 0 ? readingSequence[currentIndex + 1] : undefined;

  return (
    <section class="article-knowledge" aria-label="文章知识关联">
      <div class="article-knowledge__group">
        <h2>本文属于</h2>
        <p class="article-knowledge__links">
          {section ? (
            <a href={`/${section.slug}`}>{section.name}</a>
          ) : (
            <span>{knowledge.section}</span>
          )}
          {topics.map((topic) => (
            <a href={`/topics/${topic!.slug}`}>专题：{topic!.name}</a>
          ))}
        </p>
      </div>
      <div class="article-knowledge__group">
        <h2>核心概念</h2>
        {concepts.length ? (
          <p class="article-knowledge__links">
            {concepts.map((concept) => (
              <a href={`/concepts/${concept!.slug}`}>{concept!.name}</a>
            ))}
          </p>
        ) : (
          <p>概念关联待人工复核。</p>
        )}
      </div>
      <div class="article-knowledge__group article-knowledge__reading-path">
        <h2>阅读路径</h2>
        <nav aria-label="文章阅读路径">
          {previous ? (
            <a href={`/${previous.slug}`}>
              上一篇：{previous.frontmatter?.title}
            </a>
          ) : (
            <span>上一篇：无</span>
          )}
          {next ? (
            <a href={`/${next.slug}`}>下一篇：{next.frontmatter?.title}</a>
          ) : (
            <span>下一篇：无</span>
          )}
          {topics[0] ? (
            <a href={`/topics/${topics[0]!.slug}`}>返回专题</a>
          ) : null}
          {section ? <a href={`/${section.slug}`}>返回栏目</a> : null}
        </nav>
      </div>
      <details class="article-knowledge__details">
        <summary>文章信息</summary>
        <dl>
          <div>
            <dt>首次发布</dt>
            <dd>{knowledge.date || "待补充"}</dd>
          </div>
          <div>
            <dt>最后更新</dt>
            <dd>{knowledge.updated || knowledge.date || "待补充"}</dd>
          </div>
          <div>
            <dt>所属栏目</dt>
            <dd>{knowledge.section}</dd>
          </div>
          <div>
            <dt>阅读层级</dt>
            <dd>{knowledge.readingLevel}</dd>
          </div>
        </dl>
      </details>
    </section>
  );
};

export const CoreJudgmentCard: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const judgments = asStringArray(
    fileData.frontmatter?.key_points ??
      fileData.frontmatter?.keyPoints ??
      fileData.frontmatter?.coreJudgments ??
      fileData.frontmatter?.core_judgments,
  ).slice(0, 5);

  if (!isArticlePage(fileData) || judgments.length === 0) return null;

  return (
    <section class="key-points-card" aria-label="本文核心判断">
      <div class="key-points-card__inner">
        <h2 class="key-points-card__title">本文核心判断</h2>
        <ol class="key-points-card__list">
          {judgments.map((judgment) => (
            <li class="key-points-card__item">{judgment}</li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export const SeriesNavigation: QuartzComponent = ({
  fileData,
  allFiles,
  displayClass,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null;

  const currentSeries = getSeries(fileData.frontmatter?.series);
  if (!currentSeries) return null;

  const pages = articleFiles(allFiles)
    .filter((file) => getSeries(file.frontmatter?.series) === currentSeries)
    .sort(byOldestFirst);

  if (pages.length < 2) return null;

  const currentIndex = pages.findIndex((file) => file.slug === fileData.slug);
  if (currentIndex === -1) return null;

  const previous = pages[currentIndex - 1];
  const next = pages[currentIndex + 1];
  const seriesIndex = pages.find((file) => file.slug?.endsWith("/index"));

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
  );
};

export const ContinueReading: QuartzComponent = ({
  cfg,
  fileData,
  allFiles,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null;

  const currentSeries = getSeries(fileData.frontmatter?.series);
  const recommendations = articleFiles(allFiles)
    .filter((file) => file.slug !== fileData.slug)
    .filter(isEligibleRecommendation)
    .filter((file) => {
      const sharedTopics = sharedTopicCount(fileData, file);
      const sharedConcepts = sharedConceptCount(fileData, file);
      return (
        (currentSeries &&
          getSeries(file.frontmatter?.series) === currentSeries) ||
        sharedTopics > 0 ||
        sharedConcepts > 0 ||
        (sameSection(fileData, file) && knowledgeFor(file)?.recommended)
      );
    })
    .sort(byRecommendationScore(fileData, currentSeries))
    .slice(0, 5);

  if (recommendations.length === 0) return null;

  return (
    <section class="related-reading" aria-label="继续阅读">
      <h2 class="related-reading__heading">继续阅读</h2>
      <div class="related-grid">
        {recommendations.map((page) => (
          <a
            class="related-card"
            data-card="recommendation"
            href={resolveRelative(fileData.slug!, page.slug!)}
          >
            <span class="related-card__title">{page.frontmatter?.title}</span>
            <p class="related-card__meta">
              {page.dates ? (
                <Date date={getDate(cfg, page)!} locale={cfg.locale} />
              ) : null}
              {knowledgeFor(page)?.section || page.frontmatter?.category ? (
                <span>
                  {String(
                    knowledgeFor(page)?.section ?? page.frontmatter?.category,
                  )}
                </span>
              ) : null}
            </p>
            {getArticleSummary(page) ? (
              <p class="related-card__summary">{getArticleSummary(page)}</p>
            ) : null}
          </a>
        ))}
      </div>
    </section>
  );
};

export const ArticleCta: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null;

  return (
    <section class="article-cta" aria-label="文章结尾信息">
      <div class="article-cta__copy">
        <h2 class="article-cta__title">进一步阅读与联系</h2>
        <p>
          如果你希望继续了解公民秩序主义的完整框架，可先阅读介绍手册；严肃交流可通过邮箱联系。
        </p>
      </div>
      <div class="article-cta__links">
        <div class="article-cta__item article-cta__item--primary">
          <span class="article-cta__label">资料入口</span>
          <span class="article-cta__value">
            <a
              class="article-cta__button"
              href="/files/civic-orderism-introduction-manual.pdf"
            >
              阅读 PDF 介绍手册
            </a>
          </span>
        </div>
        <div class="article-cta__item">
          <span class="article-cta__label">主邮箱</span>
          <span class="article-cta__value">
            <a href="mailto:citizenorder@proton.me">citizenorder@proton.me</a>
          </span>
        </div>
        <div class="article-cta__item">
          <span class="article-cta__label">备用邮箱</span>
          <span class="article-cta__value">
            <a href="mailto:civicorderism@gmail.com">civicorderism@gmail.com</a>
          </span>
        </div>
      </div>
    </section>
  );
};

export const ReadingProgress: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null;
  return <div class="article-reading-progress" aria-hidden="true" />;
};

ReadingProgress.css = style;
ReadingProgress.afterDOMLoaded = script;
CoreJudgmentCard.css = style;
SeriesNavigation.css = style;
ContinueReading.css = style;
KnowledgeContext.css = style;
ArticleCta.css = style;

export const ArticleCoreJudgmentCard = (() =>
  CoreJudgmentCard) satisfies QuartzComponentConstructor;
export const ArticleSeriesNavigation = (() =>
  SeriesNavigation) satisfies QuartzComponentConstructor;
export const ArticleContinueReading = (() =>
  ContinueReading) satisfies QuartzComponentConstructor;
export const ArticleKnowledgeContext = (() =>
  KnowledgeContext) satisfies QuartzComponentConstructor;
export const ArticleEndingCta = (() =>
  ArticleCta) satisfies QuartzComponentConstructor;
export const ArticleReadingProgress = (() =>
  ReadingProgress) satisfies QuartzComponentConstructor;
