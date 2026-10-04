import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import RecentResearch from "./RecentResearch";
// CSS is registered here because getComponentResources() walks the components
// declared in quartz.layout.ts, not component instances returned by a
// constructor. Identical strings collapse into one entry via a Set.
import researchStyle from "./styles/recentResearch.scss";

/**
 * V6 — Institutional Editorial · Homepage opening
 *
 * Quartz 只在 layout 中渲染组件，markdown 里的 `<Component />` 不会被替换。
 * 因此首页的 01 Hero 与 02 最新研究放在这里，作为 beforeBody 组件渲染；
 * 03–07 仍然保留在 content/index.md 中，便于继续用 Markdown 维护文案。
 *
 * 两者都使用 .v6 命名空间，视觉上拼成同一个连续的机构落地页。
 *
 * ── HERO · E3「Radical Minimal」──────────────────────────────────────
 * 整张 viewport 是一张画布，不是「左栏文字 + 右栏图形」。右侧主动留白。
 * 不设任何独立图形：整页只由 中文主标题 / 品牌文字 / 细线 / 编号 /
 * metadata / 留白 构成。
 *
 * 三层信息架构，三层不混：
 *   A 主叙事   品牌 → 主标题 → 核心正文 → 辅助句
 *   B 行动层   新访客入口（主） + 路线入口 / 参与入口（次）
 *   C 状态层   编号 + CURRENT PHASE + 阶段 / 框架 / 年份
 *
 * 视觉层级：文字 > 留白；Hero 以 metadata 收尾。
 * 本轮只做既有 production 内容到 E3 的映射，不改文案、不改 URL。
 */
const V6HomeHero: QuartzComponent = ({
  displayClass,
  ...rest
}: QuartzComponentProps) => {
  const Research = RecentResearch({ secondaryCount: 3 });
  return (
    <div class={`v6 ${displayClass ?? ""}`}>
      {/*
        SECTION 01 / HERO
        主叙事 → 行动层 → 状态层，全部落在一张画布内。
      */}
      <section class="v6-hero v6-hero--e3" id="identity">
        {/*
          画布上缘的横向细线 + 左侧极短 accent。
          纯装饰，不承载信息，因此 aria-hidden。
        */}
        <div class="v6-hero__rule" aria-hidden="true" />

        <div class="v6-hero__canvas">
          {/* ══ A 主叙事层 ══ */}
          <div class="v6-hero__narrative">
            {/*
              编号 + 当前阶段。01 属于全站章节式设计语言
              （首页区块为 01–07），不是装饰。
            */}
            <p class="v6-hero__eyebrow">
              <span class="v6-hero__eyebrow-num">01</span>
              <span aria-hidden="true"> · </span>CURRENT PHASE
              <span aria-hidden="true"> · </span>当前阶段
            </p>

            <p class="v6-hero__brand">
              <span class="v6-hero__brand-zh">公民秩序主义</span>
              <span class="v6-hero__brand-en" lang="en">
                CIVIC ORDERISM
              </span>
            </p>

            <h1 class="v6-hero__title">
              <span class="v6-hero__title-line">
                为中国和平
                <wbr />
                政治转轨
              </span>
              <span class="v6-hero__title-em v6-hero__title-line">
                准备承接力量
              </span>
            </h1>

            <p class="v6-hero__statement">
              不革命、不清算，在保持国家连续运行的前提下，为中国未来建立一条低阻力、低风险的政治转轨路径。
            </p>

            <p class="v6-hero__institution">我们研究未来，也为未来建立组织。</p>
          </div>

          {/*
            ══ B 行动层 ══
            Level 1 新访客入口：Hero 主内容区唯一的 accent text CTA。
            Level 2/3 路线与参与入口：secondary textual navigation，
            无填充 / 无边框 / 无圆角 / 无 box。三者严格不平级。
          */}
          <div class="v6-hero__actions">
            <p class="v6-hero__start">
              <a class="v6-hero__start-link" href="/start-here/">
                第一次来？5分钟了解公民秩序主义{" "}
                <span class="v6-hero__start-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </p>
            <p class="v6-hero__nav">
              <a class="v6-hero__nav-link" href="/civic-orderism">
                了解我们的路线 <span aria-hidden="true">→</span>
              </a>
              <a class="v6-hero__nav-link" href="/participate">
                参与组织建设 <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>

          {/*
            ══ C 状态 / metadata 层 ══
            desktop / tablet 左右双列，mobile 单列。
            仅用 typography + whitespace 分组 ——
            不新增 separator / card / box / border / pill / icon / divider。
          */}
          <div class="v6-hero__meta">
            <div class="v6-hero__meta-col v6-hero__meta-col--left">
              <p class="v6-hero__meta-primary">
                POLITICAL TRANSITION FRAMEWORK
                <span aria-hidden="true"> · </span>2026
              </p>
              <p class="v6-hero__meta-secondary">
                和平政治转轨路线建设与组织筹备
              </p>
            </div>
            <div class="v6-hero__meta-col v6-hero__meta-col--right">
              <p class="v6-hero__meta-primary" lang="en">
                CIVIC ORDERISM
              </p>
              <p class="v6-hero__meta-secondary" lang="en">
                Political Transition Framework &amp; Organizational Preparation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02 / ANALYSIS & JUDGMENT — 重点文章 + 编辑索引。 */}
      <section class="v6-section v6-section--plain" id="latest">
        <div class="v6__container">
          <div class="v6-section__head">
            <p class="v6-eyebrow">
              <span class="v6-eyebrow__num">02</span>
              <span aria-hidden="true"> · </span>ANALYSIS &amp; JUDGMENT
            </p>
            <h2 class="v6-section__title">分析与判断</h2>
          </div>
          <Research {...rest} />
        </div>
      </section>
    </div>
  );
};

V6HomeHero.css = researchStyle;

export default (() => V6HomeHero) satisfies QuartzComponentConstructor;
