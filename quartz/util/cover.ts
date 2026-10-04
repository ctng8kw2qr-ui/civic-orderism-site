import { GlobalConfiguration } from "../cfg";
import { QuartzPluginData } from "../plugins/vfile";

/**
 * V6 — Editorial Cover metadata (Phase 3)
 * ================================================================
 *
 * **单一来源。** 一篇文章只有一个 cover，由三个消费端共用：
 *
 *   1. 文章页     ArticleInstitutionalHeader   → <figure class="article-inst__cover">
 *   2. 首页 Lead  RecentResearch               → <figure class="v6-latest__lead-cover">
 *   3. 社交分享   Head                         → og:image / twitter:image
 *
 * 刻意不建立 homepageCover / ogCover / articleCover 这类分叉字段。
 * 若未来真实需求证明需要不同裁切，再按需增加 variant，而不是现在就分三套。
 *
 * ── fallback 契约 ────────────────────────────────────────────────
 * 无 cover 时：
 *   - 消费端不输出 <figure>
 *   - 不输出 <img>
 *   - 不输出 placeholder
 *   - 不预留图片高度
 * 即「素材系统是 progressive enhancement：没有任何正式素材时网站依然完整」。
 *
 * 注意：**SVG 也是图片**，raster/vector 的裁切差异属消费端样式问题，
 * 不在 metadata 层区分。
 */

export interface CoverMeta {
  /** 站点相对路径，始终以 "/" 开头；无 cover 时为 null。 */
  src: string | null;
  /** 有 coverAlt 用 coverAlt，否则回退到文章标题；无 cover 时为 null。 */
  alt: string | null;
}

/**
 * 只接受站点相对路径。拒绝：
 *   - 空值 / 非字符串
 *   - 外部 URL（http:, https:, //）→ 防止外链图床与版权/性能风险
 *   - 相对路径（不以 / 开头）→ 避免不同 slug 深度下解析出错
 */
function normalizeCoverPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) return null;
  if (!raw.startsWith("/")) return null;
  return raw;
}

export function resolveCover(fileData: QuartzPluginData): CoverMeta {
  const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>;
  const src = normalizeCoverPath(fm.cover);
  if (!src) return { src: null, alt: null };

  const rawAlt = typeof fm.coverAlt === "string" ? fm.coverAlt.trim() : "";
  const title = typeof fm.title === "string" ? fm.title.trim() : "";
  return { src, alt: rawAlt || title || null };
}

/**
 * 把站点相对 cover 路径转成绝对 URL，供 og:image / twitter:image 使用。
 *
 * 复用 Quartz 既有的 `cfg.baseUrl`（也就是 quartz.config.ts 的
 * configuration.baseUrl），**不在组件里重复 hardcode 域名**。
 * 这样 development / production 由同一处配置决定。
 *
 * 相对路径的 og:image 是无效的，因此这里必须返回绝对 URL；
 * 若 baseUrl 未配置则返回 null，让调用方回退到 branded fallback。
 */
export function absoluteCoverUrl(
  cfg: GlobalConfiguration,
  cover: CoverMeta,
): string | null {
  if (!cover.src) return null;
  const base = (cfg.baseUrl ?? "").replace(/\/+$/, "");
  if (!base) return null;
  const hasProtocol = /^https?:\/\//i.test(base);
  const origin = hasProtocol ? base : `https://${base}`;
  const path = cover.src.startsWith("/") ? cover.src : `/${cover.src}`;
  return `${origin}${path}`;
}

/**
 * Editorial Cover 的统一宽高比。
 *
 * 1200×630、1600×840、2400×1260 三者都精确等于 40/21 ≈ 1.9048，
 * 因此一套视觉可以同时服务 文章页 / 首页 Lead / 社交分享，
 * 不必为同一篇文章维护三张几乎相同的图片。
 *
 * 用精确比值而非小数近似，避免三处出现细微不一致。
 */
export const COVER_ASPECT_RATIO = "40 / 21";

/** 统一比例的数值形式，供需要计算的场合使用。 */
export const COVER_ASPECT_RATIO_VALUE = 40 / 21;

/** 已知 branded fallback 的尺寸（quartz/static/og-image.png 实测 1200×630）。 */
export const FALLBACK_OG_IMAGE = "/og-image.png";
export const FALLBACK_OG_WIDTH = 1200;
export const FALLBACK_OG_HEIGHT = 630;
