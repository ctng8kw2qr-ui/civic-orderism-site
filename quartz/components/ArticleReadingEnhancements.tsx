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
import readingSequencesConfig from "../../data/reading-sequences.config.json";
import {
  getConceptPublicationStatus,
  isVisibleConcept,
  resolveReadingSequence,
} from "../util/knowledgeNavigation";

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
type PublishedConcept = (typeof conceptsConfig)[number];
type ArticleSequenceItem = {
  slug?: string;
  href?: string;
  title?: string;
  file?: QuartzPluginData;
};

const MAX_RELATED_CONCEPTS = 3;
const CORE_MODEL_CONCEPT_SLUGS = [
  "party-state-stress",
  "bureaucratic-shock",
  "security-recentralization",
  "organizational-credit",
  "order-evaporation",
  "security-purge-recentralization-cycle",
] as const;
const CORE_MODEL_CONCEPT_SET = new Set<string>(CORE_MODEL_CONCEPT_SLUGS);
const CORE_MODEL_ROUTE_SLUGS = [
  "civic-orderism/possibility-of-peaceful-political-transition-in-china",
  "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
];
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
    .filter(isVisibleConcept)
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

function normalizeTaxonomyValue(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\s/_-]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function conceptsForArticle(
  file: QuartzPluginData,
  knowledge: MigrationEntry,
): PublishedConcept[] {
  const scores = new Map<string, number>();
  const addCandidate = (slug: string, score: number) => {
    if (!conceptBySlug.has(slug)) return;
    scores.set(slug, Math.max(scores.get(slug) ?? 0, score));
  };

  knowledge.concepts.forEach((slug, index) => addCandidate(slug, 1000 - index));
  asStringArray(file.frontmatter?.concepts).forEach((slug, index) =>
    addCandidate(slug, 900 - index),
  );

  const articleTopics = new Set([
    ...knowledge.topics,
    ...asStringArray(file.frontmatter?.topics),
  ]);
  articleTopics.forEach((topicSlug) => {
    const topic = topicBySlug.get(topicSlug);
    topic?.concepts.forEach((slug, index) => addCandidate(slug, 700 - index));
    conceptsConfig.forEach((concept) => {
      if (concept.topics.includes(topicSlug)) addCandidate(concept.slug, 650);
    });
  });

  const metadata = [
    ...knowledge.tags,
    ...asStringArray(file.frontmatter?.tags),
    ...asStringArray(file.frontmatter?.keywords),
    ...asStringArray(file.frontmatter?.category),
    file.frontmatter?.title,
    file.slug,
  ]
    .filter((value): value is string => typeof value === "string")
    .map(normalizeTaxonomyValue)
    .filter(Boolean);

  conceptBySlug.forEach((concept, slug) => {
    const names = [concept.name, slug].map(normalizeTaxonomyValue);
    if (
      metadata.some((value) =>
        names.some((name) => value === name || value.includes(name)),
      )
    ) {
      addCandidate(slug, 500);
    }
  });

  return [...scores.entries()]
    .sort(([aSlug, aScore], [bSlug, bScore]) => {
      if (aScore !== bScore) return bScore - aScore;
      return aSlug.localeCompare(bSlug);
    })
    .slice(0, MAX_RELATED_CONCEPTS)
    .map(([slug]) => conceptBySlug.get(slug))
    .filter((concept): concept is PublishedConcept => concept !== undefined);
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

function normalizeRelatedSlug(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/^\.\//, "")
    .replace(/^\//, "")
    .replace(/\.(?:md|html)$/, "")
    .replace(/\/$/, "");
}

function manualRelatedSlugs(file: QuartzPluginData) {
  const fields = [
    file.frontmatter?.relatedArticles,
    file.frontmatter?.related_articles,
    file.frontmatter?.related,
    file.frontmatter?.recommendations,
  ];
  return new Set(fields.flatMap(asStringArray).map(normalizeRelatedSlug));
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

function coreModelConceptForArticle(
  file: QuartzPluginData,
  knowledge: MigrationEntry | undefined,
) {
  const articleSlug = file.slug ?? "";
  return CORE_MODEL_CONCEPT_SLUGS.map((slug) => conceptBySlug.get(slug)).find(
    (concept) =>
      concept &&
      (knowledge?.concepts.includes(concept.slug) ||
        concept.representativeArticles.includes(articleSlug)),
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
  manualRelated = new Set<string>(),
) {
  return (a: QuartzPluginData, b: QuartzPluginData) => {
    const score = (file: QuartzPluginData) => {
      let total = 0;
      // Explicit editorial relationships and shared models should lead the
      // reading path. Section proximity is only a fallback signal.
      if (file.slug && manualRelated.has(file.slug)) total += 50000;
      if (
        currentSeries &&
        getSeries(file.frontmatter?.series) === currentSeries
      )
        total += 30000;
      total += sharedConceptCount(current, file) * 10000;
      total += sharedTopicCount(current, file) * 2000;
      if (sameSection(current, file)) total += 200;
      if (knowledgeFor(file)?.recommended) total += 10;
      const time =
        file.dates?.published?.getTime() ?? file.dates?.created?.getTime() ?? 0;
      return total * 10000000000000 + time;
    };
    return score(b) - score(a);
  };
}

export const KnowledgeContext: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  if (!isArticlePage(fileData)) return null;
  const knowledge = knowledgeFor(fileData);
  if (!knowledge) return null;

  const section = sectionByName.get(knowledge.section);
  const primaryTopic = knowledge.primaryTopic
    ? topicBySlug.get(knowledge.primaryTopic)
    : undefined;
  const relatedTopics = knowledge.relatedTopics
    .map((slug) => topicBySlug.get(slug))
    .filter(Boolean);
  const concepts = conceptsForArticle(fileData, knowledge);

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
          {primaryTopic ? (
            <a href={`/topics/${primaryTopic.slug}`}>
              专题：{primaryTopic.name}
            </a>
          ) : null}
          {relatedTopics.map((topic) => (
            <a href={`/topics/${topic!.slug}`}>关联专题：{topic!.name}</a>
          ))}
        </p>
      </div>
      <div class="article-knowledge__group">
        <h2>核心概念</h2>
        {concepts.length ? (
          <p class="article-knowledge__links">
            {concepts.map((concept) => (
              <a
                class={`article-knowledge__concept article-knowledge__concept--${getConceptPublicationStatus(concept!)}`}
                href={`/concepts/${concept!.slug}`}
              >
                {concept!.name}
                {getConceptPublicationStatus(concept!) === "reviewing" ? (
                  <small>研究概念</small>
                ) : null}
              </a>
            ))}
          </p>
        ) : (
          <p>暂无关联核心概念</p>
        )}
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
  const judgments = asStringArray(fileData.frontmatter?.coreJudgments);

  if (!isArticlePage(fileData) || judgments.length === 0) return null;

  return (
    <section
      class="article-core-judgments key-points-card"
      aria-label="本文核心判断"
    >
      <div class="key-points-card__inner">
        <h2 class="key-points-card__title" data-toc-ignore="true">
          本文核心判断
        </h2>
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
        ) : null}
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
        ) : null}
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
  const manualRelated = manualRelatedSlugs(fileData);
  const eligibleArticles = articleFiles(allFiles).filter(
    isEligibleRecommendation,
  );
  const eligibleBySlug = new Map(
    eligibleArticles.map((file) => [file.slug ?? "", file]),
  );
  const coreModel = coreModelConceptForArticle(
    fileData,
    knowledgeFor(fileData),
  );
  const manualSequence = resolveReadingSequence(
    readingSequencesConfig,
    eligibleArticles,
    fileData.slug ?? "",
    (file) => file.slug,
  );
  const fallbackSequence = manualSequence
    ? []
    : eligibleArticles
        .filter((file) => sameSection(fileData, file))
        .sort(byOldestFirst);
  const fallbackIndex = fallbackSequence.findIndex(
    (file) => file.slug === fileData.slug,
  );
  const previousItem: ArticleSequenceItem | undefined = manualSequence
    ? manualSequence.items[manualSequence.index - 1]
    : fallbackIndex > 0
      ? {
          slug: fallbackSequence[fallbackIndex - 1].slug,
          file: fallbackSequence[fallbackIndex - 1],
        }
      : undefined;
  const nextItem: ArticleSequenceItem | undefined = manualSequence
    ? manualSequence.items[manualSequence.index + 1]
    : fallbackIndex >= 0 && fallbackSequence[fallbackIndex + 1]
      ? {
          slug: fallbackSequence[fallbackIndex + 1].slug,
          file: fallbackSequence[fallbackIndex + 1],
        }
      : undefined;
  const itemHref = (item: ArticleSequenceItem | undefined) =>
    item?.href ?? (item?.slug ? `/${item.slug}` : undefined);
  const itemTitle = (item: ArticleSequenceItem | undefined) =>
    item?.title ?? item?.file?.frontmatter?.title;
  const previousHref = itemHref(previousItem);
  const nextHref = itemHref(nextItem);
  const adjacentSequenceSlugs = new Set(
    [previousItem?.slug, nextItem?.slug].filter((slug): slug is string =>
      Boolean(slug),
    ),
  );
  const recommendations = eligibleArticles
    .filter((file) => file.slug !== fileData.slug)
    .filter((file) => !file.slug || !adjacentSequenceSlugs.has(file.slug))
    .filter((file) => {
      const sharedTopics = sharedTopicCount(fileData, file);
      const sharedConcepts = sharedConceptCount(fileData, file);
      return (
        (currentSeries &&
          getSeries(file.frontmatter?.series) === currentSeries) ||
        sharedTopics > 0 ||
        sharedConcepts > 0 ||
        sameSection(fileData, file) ||
        (file.slug !== undefined && manualRelated.has(file.slug))
      );
    })
    .sort(byRecommendationScore(fileData, currentSeries, manualRelated))
    .slice(0, 3);

  const usedCoreModelArticles = new Set([fileData.slug ?? ""]);
  const relatedCoreModelSlugs = coreModel
    ? new Set(
        coreModel.related.filter((slug) => CORE_MODEL_CONCEPT_SET.has(slug)),
      )
    : new Set<string>();
  const orderedCoreModelSlugs = coreModel
    ? [
        ...CORE_MODEL_CONCEPT_SLUGS.filter(
          (slug) => slug !== coreModel.slug && relatedCoreModelSlugs.has(slug),
        ),
        ...CORE_MODEL_CONCEPT_SLUGS.filter(
          (slug) => slug !== coreModel.slug && !relatedCoreModelSlugs.has(slug),
        ),
      ]
    : [];
  const coreModelRecommendations = orderedCoreModelSlugs
    .flatMap((conceptSlug) => {
      const concept = conceptBySlug.get(conceptSlug);
      if (!concept) return [];
      const page = concept.representativeArticles
        .map((slug) => eligibleBySlug.get(slug))
        .find(
          (candidate) =>
            candidate?.slug && !usedCoreModelArticles.has(candidate.slug),
        );
      if (!page?.slug) return [];
      usedCoreModelArticles.add(page.slug);
      return [{ page, label: concept.name }];
    })
    .slice(0, 3);
  const routeRecommendations = coreModel
    ? CORE_MODEL_ROUTE_SLUGS.map((slug) => eligibleBySlug.get(slug))
        .filter((page): page is QuartzPluginData => {
          if (!page?.slug) return false;
          return !usedCoreModelArticles.has(page.slug);
        })
        .slice(0, Math.max(0, 4 - coreModelRecommendations.length))
    : [];

  const recommendationCard = (page: QuartzPluginData, label?: string) => (
    <a
      class="related-card"
      data-card="recommendation"
      href={resolveRelative(fileData.slug!, page.slug!)}
    >
      {label ? <small class="related-card__eyebrow">{label}</small> : null}
      <span class="related-card__title">{page.frontmatter?.title}</span>
      <p class="related-card__meta">
        {page.dates ? (
          <Date date={getDate(cfg, page)!} locale={cfg.locale} />
        ) : null}
        {knowledgeFor(page)?.section || page.frontmatter?.category ? (
          <span>
            {String(knowledgeFor(page)?.section ?? page.frontmatter?.category)}
          </span>
        ) : null}
      </p>
      {getArticleSummary(page) ? (
        <p class="related-card__summary">{getArticleSummary(page)}</p>
      ) : null}
    </a>
  );

  if (
    coreModel &&
    (coreModelRecommendations.length > 0 || routeRecommendations.length > 0)
  ) {
    return (
      <section
        class="related-reading related-reading--model"
        aria-label="继续阅读"
      >
        <h2 class="related-reading__heading">继续阅读</h2>
        {coreModelRecommendations.length ? (
          <div class="continue-reading__direction">
            <h3>继续理解这个模型</h3>
            <div class="related-grid related-grid--compact">
              {coreModelRecommendations.map(({ page, label }) =>
                recommendationCard(page, label),
              )}
            </div>
          </div>
        ) : null}
        {routeRecommendations.length ? (
          <div class="continue-reading__direction continue-reading__direction--route">
            <h3>从判断进入路线</h3>
            <div class="related-grid related-grid--compact related-grid--route">
              {routeRecommendations.map((page) =>
                recommendationCard(page, "政治路线"),
              )}
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  if (!previousHref && !nextHref && recommendations.length === 0) return null;

  return (
    <section class="related-reading" aria-label="继续阅读">
      <h2 class="related-reading__heading">继续阅读</h2>
      {previousHref || nextHref ? (
        <nav class="continue-reading__nav" aria-label="上一篇和下一篇">
          {previousHref ? (
            <a href={previousHref} data-slug={previousItem?.slug}>
              <small>上一篇</small>
              <strong>{itemTitle(previousItem)}</strong>
            </a>
          ) : null}
          {nextHref ? (
            <a href={nextHref} data-slug={nextItem?.slug}>
              <small>下一篇</small>
              <strong>{itemTitle(nextItem)}</strong>
            </a>
          ) : null}
        </nav>
      ) : null}
      {recommendations.length ? (
        <div class="continue-reading__related">
          <h3>相关文章</h3>
          <div class="related-grid">
            {recommendations.map((page) => recommendationCard(page))}
          </div>
        </div>
      ) : null}
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
        <h2 class="article-cta__title">进一步了解公民秩序主义</h2>
        <p>公民秩序主义目前正在推进北美非营利法人及首届董事会筹备工作。</p>
      </div>
      <div class="article-cta__links">
        <div class="article-cta__item article-cta__item--primary">
          <span class="article-cta__label">当前重点</span>
          <span class="article-cta__value">
            <a class="article-cta__button" href="/preparation">
              了解董事会筹备
            </a>
          </span>
        </div>
        <div class="article-cta__item">
          <span class="article-cta__label">理论与路线</span>
          <span class="article-cta__value">
            <a href="/start-here">5分钟了解公民秩序主义</a>
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
