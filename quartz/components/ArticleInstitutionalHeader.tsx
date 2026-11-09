import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import { resolveRelative, FullSlug } from "../util/path";
import { Element, Root } from "hast";
import { toString } from "hast-util-to-string";
import { resolveCover } from "../util/cover";
import migrationMap from "../../content-migration-map.json";
import siteConfig from "../../data/site.config.json";
import topicsConfig from "../../data/topics.config.json";
import contentMap from "../../data/phase2-content-map.json";

// @ts-ignore
import script from "./scripts/institutionalArticle.inline";

function isElement(node: Root["children"][number]): node is Element {
  return node.type === "element";
}

function hasClass(node: Element, className: string) {
  const value = node.properties?.className;
  const classes = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\s+/)
      : [];
  return classes.includes(className);
}

function articleSubtitle(tree: QuartzComponentProps["tree"]) {
  if (tree.type !== "root") return undefined;
  const root = tree as Root;
  const titleIndex = root.children.findIndex(
    (node) => isElement(node) && node.tagName === "h1",
  );
  const subtitle = root.children
    .slice(titleIndex >= 0 ? titleIndex + 1 : 0)
    .find(
      (node) =>
        isElement(node) && node.tagName === "p" && hasClass(node, "subtitle"),
    );
  return subtitle && isElement(subtitle)
    ? toString(subtitle).trim()
    : undefined;
}

type MigrationEntry = {
  slug: string;
  section?: string;
  primaryTopic?: string | null;
  [key: string]: unknown;
};

type TopicEntry = {
  slug: string;
  name: string;
  [key: string]: unknown;
};

const SECTION_HREF: Record<string, string> = {
  解析中共: "/china/analysis/",
  公民秩序主义: "/civic-orderism/",
  中国未来: "/china-future/",
  制度设计: "/institution-design/",
  理论总论: "/theory/",
  司法与宪政: "/theory/",
};

// 文章面包屑：首页 → 所属一级栏目 → 研究程序 → 子类。
// 解析中共/中国未来属于政治经济观察；公民秩序主义/核心价值属于政治路线；
// 制度设计属于理论与制度。历史文章 URL 不参与此判断。
const PRIMARY_CONTEXT: Record<string, { label: string; href: string }> = {
  政治经济观察: { label: "政治经济观察", href: "/china/" },
  政治路线: { label: "政治路线", href: "/civic-orderism/" },
  理论与制度: { label: "理论与制度", href: "/theory/" },
  解析中共: { label: "政治经济观察", href: "/china/" },
  中国未来: { label: "政治经济观察", href: "/china/" },
  公民秩序主义: { label: "政治路线", href: "/civic-orderism/" },
  核心政治总论: { label: "政治路线", href: "/civic-orderism/" },
  制度设计: { label: "理论与制度", href: "/theory/" },
};

const PROGRAM_LABELS: Record<string, string> = {
  解析中共: "UNDERSTANDING THE PRESENT",
  公民秩序主义: "POLITICAL ROUTE",
  中国未来: "CHINA'S FUTURE",
  制度设计: "INSTITUTIONAL DESIGN",
  理论总论: "THEORY",
  司法与宪政: "JUSTICE & CONSTITUTION",
};

const migrationBySlug = new Map<string, MigrationEntry>(
  (migrationMap as MigrationEntry[]).map((entry) => [entry.slug, entry]),
);
type ContentEntry = {
  slug: string;
  primary_section?: string;
  category?: string;
  subcategory?: string;
};
const contentBySlug = new Map<string, ContentEntry>(
  (contentMap.articles as ContentEntry[]).map((entry) => [entry.slug, entry]),
);

const topicBySlug = new Map<string, TopicEntry>(
  (topicsConfig as TopicEntry[]).map((topic) => [topic.slug, topic]),
);

function chineseCharacterCount(text: string): number {
  return (text.match(/[\u3400-\u9fff]/g) ?? []).length;
}

function estimatedReadingMinutes(fileData: QuartzComponentProps["fileData"]) {
  const text = typeof fileData.text === "string" ? fileData.text : "";
  const chars = chineseCharacterCount(text);
  if (chars === 0) return undefined;
  return Math.max(1, Math.round(chars / 450));
}

function formattedDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const ArticleInstitutionalHeader: QuartzComponent = ({
  fileData,
  tree,
}: QuartzComponentProps) => {
  const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>;

  const title = typeof fm.title === "string" ? fm.title : "";
  const category = typeof fm.category === "string" ? fm.category : "";
  const section = typeof fm.section === "string" ? fm.section : "";
  const frontmatterSubtitle =
    typeof fm.subtitle === "string" ? fm.subtitle.trim() : "";
  const deck = frontmatterSubtitle || articleSubtitle(tree) || "";
  const dateText = formattedDate(fm.date);
  // Editorial Cover comes from the shared single source (quartz/util/cover),
  // the same resolution used by the homepage Lead and by og:image. When absent
  // the header renders its typographic form: no <figure>, no <img>, no
  // placeholder, no reserved height.
  const cover = resolveCover(fileData);
  const minutes = estimatedReadingMinutes(fileData);
  const slug = (fileData.slug ?? "") as FullSlug;
  const isCorePoliticalStatement = fm.corePoliticalStatement === true;

  // Research Program comes from the real migration mapping (研究程序),
  // with the frontmatter category as fallback. The first level uses the
  // article primary section; the third uses the frontmatter section/topic.
  const knowledge = migrationBySlug.get(fileData.slug ?? "");
  const content = contentBySlug.get(fileData.slug ?? "");
  // The value-goal article is classified by its role (价值目标), never as a
  // second “political framework”. The label comes from the site config, so no
  // extra hardcoded copy exists.
  const coreStatementLabel = siteConfig.corePoliticalStatement.roleLabel;
  const originalProgram =
    (knowledge?.section && SECTION_HREF[knowledge.section]
      ? knowledge.section
      : SECTION_HREF[category]
        ? category
        : knowledge?.section) || category;
  const programName = isCorePoliticalStatement
    ? coreStatementLabel
    : content?.primary_section === "理论与制度"
      ? content.category || originalProgram
      : originalProgram;
  const programHref = SECTION_HREF[programName];
  const programLabel = isCorePoliticalStatement
    ? "CORE POLITICAL STATEMENT"
    : (PROGRAM_LABELS[programName] ?? "RESEARCH");
  const primaryTopic = knowledge?.primaryTopic
    ? topicBySlug.get(knowledge.primaryTopic)
    : undefined;
  const thirdLevel = isCorePoliticalStatement
    ? ""
    : section || primaryTopic?.name || "";
  const primaryContext = PRIMARY_CONTEXT[
    content?.primary_section ?? knowledge?.section ?? category
  ] ?? {
    label: "首页",
    href: "/",
  };

  return (
    <div
      role="region"
      aria-label="文章信息"
      class={`article-inst${isCorePoliticalStatement ? " article-inst--core-statement" : ""}`}
    >
      <nav class="article-inst__context" aria-label="文章路径">
        <a
          class="article-inst__context-link"
          href={resolveRelative(slug, "/" as FullSlug)}
        >
          首页
        </a>
        <span class="article-inst__context-sep" aria-hidden="true">
          /
        </span>
        <a
          class="article-inst__context-link"
          href={resolveRelative(slug, primaryContext.href as FullSlug)}
        >
          {primaryContext.label}
        </a>
        <span class="article-inst__context-sep" aria-hidden="true">
          /
        </span>
        {isCorePoliticalStatement ? (
          <span class="article-inst__context-current">
            {coreStatementLabel}
          </span>
        ) : programHref ? (
          <a
            class="article-inst__context-link"
            href={resolveRelative(slug, programHref as FullSlug)}
          >
            {programName}
          </a>
        ) : (
          <span class="article-inst__context-static">{programName}</span>
        )}
        {thirdLevel ? (
          <>
            <span class="article-inst__context-sep" aria-hidden="true">
              /
            </span>
            <span class="article-inst__context-current">{thirdLevel}</span>
          </>
        ) : null}
      </nav>

      <p class="article-inst__program">
        <span class="article-inst__program-label">{programLabel}</span>
        <span class="article-inst__program-sep" aria-hidden="true">
          ·
        </span>
        <span class="article-inst__program-zh">
          {programName}
          {thirdLevel ? ` / ${thirdLevel}` : ""}
        </span>
      </p>

      {cover.src ? (
        <figure class="article-inst__cover">
          <img
            src={cover.src}
            alt={cover.alt ?? ""}
            width="1600"
            height="840"
            decoding="async"
            loading="eager"
          />
        </figure>
      ) : null}

      <h1 class="article-inst__title">{title}</h1>

      {deck ? <p class="article-inst__deck">{deck}</p> : null}

      <p class="article-inst__meta">
        {!isCorePoliticalStatement && dateText ? <time>{dateText}</time> : null}
        {minutes ? <span>约 {minutes} 分钟阅读</span> : null}
        {isCorePoliticalStatement ? (
          <span>公民秩序主义核心政治文本</span>
        ) : programName ? (
          <span>研究项目：{programName}</span>
        ) : null}
      </p>
    </div>
  );
};

ArticleInstitutionalHeader.afterDOMLoaded = script;

export default (() =>
  ArticleInstitutionalHeader) satisfies QuartzComponentConstructor;
