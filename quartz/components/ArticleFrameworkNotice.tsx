import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/articleFrameworkNotice.scss";

/**
 * EARLY FRAMEWORK · 早期理论阶段
 *
 * 早期理论文章在正式政治路线成形之前，把公民秩序主义主要解释为
 * “现代国家治理方案 / 信息化时代的国家秩序方案”。这些文章保留作为理论
 * 发展记录，但不再承担介绍当前政治路线的任务，因此统一加版本提示。
 *
 * 识别规则（单一来源，不逐篇硬编码，也不修改历史正文）：
 *   1. 文章位于 civic-orderism/ 栏目；
 *   2. frontmatter category 为「公民秩序主义」；
 *   3. 形成时间在早期窗口 2026-05-01 — 2026-07-31 之间；
 *   4. 尚未归入正式章节（没有 frontmatter section），即仍属于早期框架批次。
 */
const EARLY_FRAMEWORK_FROM = "2026-05-01";
const EARLY_FRAMEWORK_TO = "2026-07-31";
const EARLY_FRAMEWORK_CATEGORY = "公民秩序主义";
const EARLY_FRAMEWORK_OVERVIEW_HREF = "/civic-orderism/civic-orderism-overview";

function normalizedDate(value: unknown): string {
  if (!value) return "";
  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === "string" ? value : String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function isEarlyFrameworkArticle({
  fileData,
}: QuartzComponentProps): boolean {
  const slug = fileData.slug ?? "";
  if (!slug.startsWith("civic-orderism/")) return false;

  const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>;
  if (fm.category !== EARLY_FRAMEWORK_CATEGORY) return false;
  if (typeof fm.section === "string" && fm.section.trim() !== "") return false;

  const date = normalizedDate(fm.date);
  if (!date) return false;
  return date >= EARLY_FRAMEWORK_FROM && date <= EARLY_FRAMEWORK_TO;
}

const ArticleFrameworkNotice: QuartzComponent = (
  props: QuartzComponentProps,
) => {
  if (!isEarlyFrameworkArticle(props)) return null;

  return (
    <aside class="article-framework-note" aria-label="版本提示">
      <p class="article-framework-note__label">
        EARLY FRAMEWORK<span aria-hidden="true"> · </span>早期理论阶段
      </p>
      <p class="article-framework-note__body">
        本文形成于公民秩序主义早期理论建设阶段，保留作为理论发展记录。当前政治路线、核心定义与正式定位，请以
        <a href={EARLY_FRAMEWORK_OVERVIEW_HREF}>《公民秩序主义总论》</a>
        及最新政治路线文件为准。
      </p>
    </aside>
  );
};

ArticleFrameworkNotice.css = style;

export default (() =>
  ArticleFrameworkNotice) satisfies QuartzComponentConstructor;
