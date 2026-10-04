import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/recentResearch.scss";
import { QuartzPluginData } from "../plugins/vfile";
import { isArticleSlug } from "../util/articlePage";

interface Options {
  /** 主文章之外显示的次级文章数量。 */
  secondaryCount?: number;
}

/**
 * V6 — Institutional Editorial · 最新研究
 *
 * 编辑出版式排布：一篇主文章 + 若干次级文章，而不是等权重卡片网格。
 *
 * 数据来源是 Quartz 构建期的 allFiles——每篇文章既有的
 * title / category / description / date frontmatter 直接生成列表，
 * 不需要手工维护清单，也不引入新的数据文件或依赖。
 *
 * ── 主文章（Lead）选稿规则 ─────────────────────────────────────
 * 机构首页的头条必须是编辑决定，而不是日期副产物。因此：
 *
 *   1. 若存在 `homepageLead: true` 的已发布文章 → 作为主文章。
 *      （1 篇为准；若有多篇，取日期最新的一篇，并输出 warning，
 *        不做随机选择。）
 *   2. 若不存在该标记 → 回退到「最新已发布文章」。
 *
 * 次级文章始终按日期倒序自动生成，并排除：
 *   - 已成为主文章的那一篇；
 *   - 首页 Section 07 已作为「价值目标」呈现的文章
 *     （category: 核心政治总论）。它与主文章同位，不应同时占据
 *     「最新研究」的第二位置。
 *
 * 本轮不引入 CMS，也不修改任何文章 URL 或分类体系。
 *
 * 说明：文章 frontmatter 使用的是 `date`，而不是 Quartz 默认的
 * `published`。因此这里直接读取 frontmatter.date，避免落到文件系统
 * mtime 这类不稳定的时间源。
 */

const SECTION_LABELS: Record<string, string> = {
  theory: "理论总纲",
  china: "解析中共",
  "china-stage": "阶段判断",
  "china-future": "中国未来",
  "civic-orderism": "政治路线",
  institution: "制度设计",
  "institution-design": "制度设计",
};

/** 已输出的构建期告警，避免同一问题在每页渲染时重复刷屏。 */
const emittedWarnings = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (emittedWarnings.has(key)) return;
  emittedWarnings.add(key);
  // eslint-disable-next-line no-console
  console.warn(`\n[homepageLead] ${message}\n`);
}

/**
 * Total ordering: newest first, then slug alphabetically.
 * The slug tiebreak matters — two articles can share the exact same
 * `date` timestamp, and without it the winner would depend on the input
 * order of allFiles rather than on an explicit rule.
 */
function byRecencyThenSlug(a: QuartzPluginData, b: QuartzPluginData): number {
  const diff = readTimestamp(b) - readTimestamp(a);
  if (diff !== 0) return diff;
  return (a.slug ?? "").localeCompare(b.slug ?? "");
}

function readTimestamp(page: QuartzPluginData): number {
  const raw = page.frontmatter?.date ?? page.frontmatter?.published;
  if (!raw) return 0;
  const time = new Date(raw as string).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * frontmatter 可能被 YAML 解析成 boolean true，也可能因为加引号
 * 而成为字符串 "true"。两种写法都认。
 */
function hasHomepageLead(page: QuartzPluginData): boolean {
  const value = page.frontmatter?.homepageLead;
  return value === true || value === "true";
}

/**
 * 价值目标文章在首页 Section 07 已经完整呈现，不再占用「最新研究」的位置。
 * 以既有 category 判定，不新增 frontmatter 字段、不新增排除名单。
 */
function isValueGoal(page: QuartzPluginData): boolean {
  return page.frontmatter?.category === "核心政治总论";
}

function readSection(page: QuartzPluginData): string {
  const category = page.frontmatter?.category;
  if (typeof category === "string" && category.trim().length > 0) {
    return category.trim();
  }
  const prefix = (page.slug ?? "").split("/")[0];
  return SECTION_LABELS[prefix] ?? "研究";
}

function formatDate(raw: unknown): string | null {
  if (!raw) return null;
  const date = new Date(raw as string);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export default ((userOpts?: Options) => {
  const secondaryCount = userOpts?.secondaryCount ?? 3;

  const RecentResearch: QuartzComponent = ({
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const published = allFiles
      .filter((page) => {
        const slug = page.slug ?? "";
        if (!isArticleSlug(slug)) return false;
        // 草稿由 RemoveDrafts 过滤器移除；这里再兜一层，避免草稿进入首页。
        if (
          page.frontmatter?.status &&
          page.frontmatter.status !== "published"
        ) {
          return false;
        }
        return Boolean(page.frontmatter?.title);
      })
      .sort(byRecencyThenSlug);

    if (published.length === 0) return null;

    // ── 选稿 ────────────────────────────────────────────────────
    // published 已按日期倒序，因此 [0] 就是「日期最新的标记文章」。
    const marked = published.filter(hasHomepageLead);

    if (marked.length > 1) {
      const tie =
        readTimestamp(marked[0]) === readTimestamp(marked[1])
          ? "（日期相同，按 slug 字母序取第一篇）"
          : "（日期最新的一篇）";
      warnOnce(
        `multiple:${marked.map((p) => p.slug).join(",")}`,
        `发现 ${marked.length} 篇文章设置了 homepageLead: true，实际只允许 1 篇。` +
          `已自动选用 ${marked[0].slug} ${tie}。` +
          `请修正以下文件，保留其中一篇：\n  - ` +
          marked.map((p) => p.slug).join("\n  - "),
      );
    }

    const lead = marked.length > 0 ? marked[0] : published[0];
    const secondary = published
      .filter((page) => page.slug !== lead.slug && !isValueGoal(page))
      .slice(0, secondaryCount);

    const href = (slug: string) => `/${slug.replace(/\/index$/, "")}`;

    return (
      <div class={`v6-latest ${displayClass ?? ""}`}>
        <a
          class="v6-latest__lead"
          href={href(lead.slug!)}
          data-slug={lead.slug}
        >
          <span class="v6-latest__lead-meta">
            <span class="v6-latest__tag">{readSection(lead)}</span>
            {formatDate(lead.frontmatter?.date) ? (
              <time
                class="v6-latest__date"
                datetime={String(lead.frontmatter?.date)}
              >
                {formatDate(lead.frontmatter?.date)}
              </time>
            ) : null}
          </span>
          <h3 class="v6-latest__lead-title">{lead.frontmatter?.title}</h3>
          {lead.frontmatter?.description ? (
            <p class="v6-latest__lead-desc">{lead.frontmatter.description}</p>
          ) : null}
          <span class="v6-latest__more">
            阅读全文 <span aria-hidden="true">→</span>
          </span>
        </a>

        {secondary.length > 0 ? (
          <ul class="v6-latest__list">
            {secondary.map((page) => (
              <li class="v6-latest__item">
                <a
                  class="v6-latest__item-link"
                  href={href(page.slug!)}
                  data-slug={page.slug}
                >
                  <span class="v6-latest__item-meta">
                    <span class="v6-latest__tag">{readSection(page)}</span>
                    {formatDate(page.frontmatter?.date) ? (
                      <time
                        class="v6-latest__date"
                        datetime={String(page.frontmatter?.date)}
                      >
                        {formatDate(page.frontmatter?.date)}
                      </time>
                    ) : null}
                  </span>
                  <span class="v6-latest__item-title">
                    {page.frontmatter?.title}
                  </span>
                  {page.frontmatter?.description ? (
                    <span class="v6-latest__item-desc">
                      {page.frontmatter.description}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  RecentResearch.css = style;
  return RecentResearch;
}) satisfies QuartzComponentConstructor;
