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

function readTimestamp(page: QuartzPluginData): number {
  const raw = page.frontmatter?.date ?? page.frontmatter?.published;
  if (!raw) return 0;
  const time = new Date(raw as string).getTime();
  return Number.isNaN(time) ? 0 : time;
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
      .sort((a, b) => readTimestamp(b) - readTimestamp(a));

    if (published.length === 0) return null;

    const [lead, ...rest] = published;
    const secondary = rest.slice(0, secondaryCount);
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
