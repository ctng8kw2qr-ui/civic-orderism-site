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
        品牌 → 主标题 → 机构说明 → 双 CTA → 新读者入口；
        右侧为辅助线稿与当前阶段。留白优先，色块只出现在主标题第二行。
      */}
      <section class="v6-hero" id="identity">
        <div class="v6__container v6-hero__grid">
          <div class="v6-hero__main">
            <p class="v6-hero__brand">
              <span class="v6-hero__brand-zh">公民秩序主义</span>
              <span class="v6-hero__brand-en" lang="en">
                CIVIC ORDERISM
              </span>
            </p>
            <h1 class="v6-hero__title">
              为中国和平政治转轨
              <span class="v6-hero__title-em">准备承接力量</span>
            </h1>
            <p class="v6-hero__statement">
              不革命、不清算，在保持国家连续运行的前提下，为中国未来建立一条低阻力、低风险的政治转轨路径。
            </p>
            <p class="v6-hero__institution">我们研究未来，也为未来建立组织。</p>
            <div class="v6-actions">
              <a class="v6-button v6-button--primary" href="/civic-orderism">
                了解我们的路线 <span aria-hidden="true">→</span>
              </a>
              <a class="v6-button v6-button--secondary" href="/participate">
                参与组织建设
              </a>
            </div>
            <p class="v6-hero__start">
              <a class="v6-link" href="/start-here/">
                第一次来？5分钟了解公民秩序主义{" "}
                <span class="v6-link__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </p>
          </div>

          <div class="v6-hero__aside">
            {/*
              Hero artwork — THRESHOLD. A structural boundary with one passage
              opened through it, and a datum running unbroken across the full
              width: the structure continues, the path changes.

              Rendered as a direct <img> of the SVG master. The old CSS-mask
              model was retired here because a mask flattens all structure into
              a single-colour alpha stencil and cannot carry a multi-weight
              drawing. The SVG handles light/dark itself via
              prefers-color-scheme, which V6 already keeps in sync with
              saved-theme — so one asset serves both themes with no filter,
              no invert and no second file.

              Decorative concept artwork: the Hero copy carries the meaning, so
              this is aria-hidden and must not be announced.
            */}
            <img
              class="v6-hero__art"
              src="/static/assets/v6/hero/hero-threshold.svg"
              alt=""
              aria-hidden="true"
              decoding="async"
            />
            {/* 当前阶段：presentation-only wrapper carrying the brand hairline.
                Same content, same order, no added information. */}
            <div class="v6-hero__phase-block">
              <p class="v6-hero__phase-label">
                CURRENT PHASE<span aria-hidden="true"> · </span>当前阶段
              </p>
              <p class="v6-hero__phase">和平政治转轨路线建设与组织筹备</p>
              <p class="v6-hero__phase-en" lang="en">
                Political Transition Framework
                <br />
                &amp; Organizational Preparation
              </p>
              <p class="v6-hero__year">2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02 / LATEST RESEARCH — 编辑出版式排布，主文章权重最高。 */}
      <section class="v6-section v6-section--plain" id="latest">
        <div class="v6__container">
          <div class="v6-section__head">
            <p class="v6-eyebrow">
              <span class="v6-eyebrow__num">02</span>
              LATEST RESEARCH<span aria-hidden="true"> · </span>最新研究
            </p>
            <h2 class="v6-section__title">最近发表的研究</h2>
          </div>
          <Research {...rest} />
        </div>
      </section>
    </div>
  );
};

V6HomeHero.css = researchStyle;

export default (() => V6HomeHero) satisfies QuartzComponentConstructor;
