import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import { selectHomepageResearch } from "../util/homepageResearch";
import { resolveCover } from "../util/cover";
import { homepagePortrait as portrait } from "../util/homepagePortrait";
import style from "./styles/officialHome.scss";

const href = (slug: string) => `/${slug.replace(/\/index$/, "")}`;
const date = (raw: unknown) => {
  const value = raw ? new Date(String(raw)) : null;
  return value && !Number.isNaN(value.getTime())
    ? new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      }).format(value)
    : "";
};
const OfficialHome: QuartzComponent = ({ allFiles }: QuartzComponentProps) => {
  const { lead, secondary, markedCount } = selectHomepageResearch(allFiles);
  if (markedCount > 1)
    console.warn(
      "[homepageLead] Multiple markers: newest date, then slug selected deterministically.",
    );
  const cover = lead ? resolveCover(lead) : null;
  return (
    <div class="co-home" id="main-content" role="main" tabIndex={-1}>
      <div class="compact">
        <section class="hero" id="identity" aria-labelledby="home-name">
          <div class="wrap hero-grid">
            <div class="hero-copy">
              <div class="identity">
                <h1 id="home-name">赵鹏博</h1>
                <p class="role">
                  公民秩序主义发起人<span aria-hidden="true">｜</span>
                  <span>中国政治经济观察</span>
                </p>
              </div>
              <div class="hero-route">
                <p class="hero-statement">保留国家，改变政治。</p>
                <p class="hero-goal">和平政治转轨</p>
                <p class="hero-mechanism">以经济赎买为核心机制</p>
                <p class="hero-principles">不革命 · 不清算</p>
              </div>
              <div class="hero-actions">
                <a class="button" href="/civic-orderism">
                  阅读政治路线
                </a>
                <a class="link" href="#research">
                  阅读中国政治经济观察
                </a>
              </div>
            </div>
            <figure class="hero-portrait">
              <picture>
                <source
                  type="image/avif"
                  media={portrait.mobile.media}
                  srcset={portrait.mobile.avifSrcset}
                  sizes={portrait.mobile.sizes}
                  width="590"
                  height="674"
                />
                <source
                  media={portrait.mobile.media}
                  srcset={portrait.mobile.srcset}
                  sizes={portrait.mobile.sizes}
                  width="590"
                  height="674"
                />
                <source
                  type="image/avif"
                  media={portrait.desktop.media}
                  srcset={portrait.desktop.avifSrcset}
                  sizes={portrait.desktop.sizes}
                  width="1086"
                  height="724"
                />
                <img
                  src={portrait.desktop.src}
                  srcset={portrait.desktop.srcset}
                  sizes={portrait.desktop.sizes}
                  alt="赵鹏博在真实公园环境中的半身照片，身着深色条纹西装与领带"
                  width="1086"
                  height="724"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </figure>
          </div>
        </section>
        <section
          class="route band political-route"
          id="political-route"
          aria-labelledby="home-route"
        >
          <div class="wrap">
            <h2 id="home-route">政治路线</h2>
            <div class="route-list">
              <article class="route-item">
                <div class="route-item__head">
                  <p class="route-item__label">政治目标</p>
                  <h3>和平政治转轨</h3>
                </div>
                <p class="route-item__body">
                  以非暴力方式完成中国政治转轨，改变政治制度。
                </p>
              </article>
              <article class="route-item">
                <div class="route-item__head">
                  <p class="route-item__label">核心机制</p>
                  <h3>经济赎买</h3>
                </div>
                <p class="route-item__body">
                  通过制度化的利益重新安排，对依靠政治权力、公共资源和不正当利益形成的资产进行处理，使符合条件的部分资产获得合法产权，为和平权力交接创造条件。
                </p>
              </article>
              <article class="route-item">
                <div class="route-item__head">
                  <p class="route-item__label">基本原则</p>
                  <h3>不革命、不清算</h3>
                </div>
                <p class="route-item__body">
                  不以暴力革命推动政治转轨，不以集体政治报复作为制度重建的起点。
                </p>
              </article>
              <article class="route-item">
                <div class="route-item__head">
                  <p class="route-item__label">根本底线</p>
                  <h3>国家连续运行</h3>
                </div>
                <p class="route-item__body">
                  政治转轨不能以行政体系瘫痪、公共服务中断或社会秩序崩溃为代价。
                </p>
              </article>
            </div>
            <a class="link route-more" href="/civic-orderism">
              阅读路线全文
            </a>
          </div>
        </section>
        <section
          class="research band"
          id="research"
          aria-labelledby="home-research"
        >
          <div class="wrap">
            <div class="section-heading">
              <h2 id="home-research">中国政治经济观察</h2>
              <a class="link" href="/china">
                浏览全部观察
              </a>
            </div>
            <div class="editorial">
              {lead ? (
                <article class="lead">
                  <a
                    class="article-link"
                    href={href(lead.slug!)}
                    data-slug={lead.slug}
                  >
                    {cover?.src ? (
                      <img
                        src={cover.src}
                        alt={cover.alt ?? ""}
                        width="1600"
                        height="842"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <div class="article-meta">
                      <span>重点阅读</span>
                      <time datetime={String(lead.frontmatter?.date ?? "")}>
                        {date(lead.frontmatter?.date)}
                      </time>
                    </div>
                    <h3>{lead.frontmatter?.title}</h3>
                    <p>
                      {String(
                        lead.frontmatter?.summary ??
                          lead.frontmatter?.description ??
                          "",
                      )}
                    </p>
                    <span class="read">阅读全文</span>
                  </a>
                </article>
              ) : (
                <p>研究文章正在整理。</p>
              )}
              <div class="latest">
                <h3 class="column-label">近期研究</h3>
                {secondary.map((p) => (
                  <article key={p.slug}>
                    <a
                      class="article-link"
                      href={href(p.slug!)}
                      data-slug={p.slug}
                    >
                      <time datetime={String(p.frontmatter?.date ?? "")}>
                        {date(p.frontmatter?.date)}
                      </time>
                      <h3>{p.frontmatter?.title}</h3>
                      <p>
                        {String(
                          p.frontmatter?.summary ??
                            p.frontmatter?.description ??
                            "",
                        )}
                      </p>
                    </a>
                  </article>
                ))}
              </div>
              <aside class="topics" aria-label="研究专题">
                <h3 class="column-label">研究专题</h3>
                <a href="/topics/bureaucratic-system">
                  <h4>官僚体系</h4>
                  <p>信息、激励与责任</p>
                </a>
                <a href="/topics/xi-era">
                  <h4>安全与治理</h4>
                  <p>组织回应与治理边界</p>
                </a>
                <a href="/china">
                  <h4>理解今天的中共</h4>
                  <p>现实与结构的总体解释</p>
                </a>
              </aside>
            </div>
          </div>
        </section>
        <section
          class="theory-org band"
          id="theory-organization"
          aria-labelledby="home-theory-org"
        >
          <div class="wrap">
            <div class="section-heading">
              <h2 id="home-theory-org">理论与组织</h2>
            </div>
            <div class="theory-org-grid">
              <a
                class="theory-org-entry"
                href="/civic-orderism/civic-orderism-overview"
              >
                <h3>公民秩序主义</h3>
                <p>理论总论</p>
              </a>
              <a class="theory-org-entry" href="/theory">
                <h3>理论与制度</h3>
                <p>研究框架</p>
              </a>
              <a class="theory-org-entry" href="/preparation">
                <h3>组织建设</h3>
                <p>筹备与边界</p>
              </a>
              <a class="theory-org-entry" href="/about/initiator">
                <h3>关于发起人</h3>
                <p>公开说明</p>
              </a>
            </div>
            <p class="org-status">
              公民秩序主义目前处于组织筹备阶段，尚未完成法人注册及首届董事会设立，也不以政党身份运行。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
OfficialHome.css = style;
export default (() => OfficialHome) satisfies QuartzComponentConstructor;
