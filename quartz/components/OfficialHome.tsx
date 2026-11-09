import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import { selectHomepageResearch } from "../util/homepageResearch";
import { resolveCover } from "../util/cover";
import { homepagePortrait as portrait } from "../util/homepagePortrait";
import site from "../../data/site.config.json";
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
                <p class="position">
                  <strong>经济赎买</strong>
                  <span>不革命 · 不清算</span>
                </p>
              </div>
              <p class="hero-summary">
                以经济赎买降低政治转轨阻力，在保持国家连续运行的前提下，推动和平权力交接与政治制度重建。
              </p>
              <div class="hero-actions">
                <a class="button" href="/civic-orderism">
                  了解政治路线
                </a>
                <a class="link" href="#research">
                  阅读政治经济观察
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
          class="route band"
          id="route"
          aria-labelledby="home-principles"
        >
          <div class="wrap">
            <h2 id="home-principles">
              改变政治，<span>不把国家一起砸碎。</span>
            </h2>
            <div class="principles">
              <article>
                <h3>经济赎买</h3>
                <p>以利益安排降低转轨阻力。</p>
              </article>
              <article>
                <h3>不革命</h3>
                <p>保持国家与社会连续运行。</p>
              </article>
              <article>
                <h3>不清算</h3>
                <p>不按身份清算，具体责任依法处理。</p>
              </article>
            </div>
            <aside class="manifesto" aria-label="固定核心政治总论入口">
              <span>{site.corePoliticalStatement.label}</span>
              <a
                class="vision-link"
                href={`/${site.corePoliticalStatement.slug}`}
              >
                {site.corePoliticalStatement.title}。
              </a>
            </aside>
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
          class="economy band"
          id="economic-redemption"
          aria-labelledby="home-economy"
        >
          <div class="wrap economy-grid">
            <h2 id="home-economy">
              为什么选择
              <br />
              经济赎买？
            </h2>
            <div>
              <div class="economy-copy">
                <article>
                  <h3>为什么需要经济赎买？</h3>
                  <p>
                    既有权力结构不只涉及职位，也涉及经济利益与安全预期。缺少可以讨论的安排，这些因素会增加政治转轨的阻力。
                  </p>
                </article>
                <article>
                  <h3>经济赎买如何降低政治转轨阻力？</h3>
                  <p>
                    通过政治沟通、利益协调与制度过渡降低政治转轨阻力。提高接受和平承接的安全感与可预期性，建立新旧政治力量之间最低限度的信任。
                  </p>
                </article>
              </div>
              <a class="link" href="/civic-orderism">
                了解经济赎买政治路线 <span aria-hidden="true">&nbsp;→</span>
              </a>
            </div>
          </div>
        </section>
        <section class="theory band" id="theory" aria-labelledby="home-theory">
          <div class="wrap">
            <div class="section-heading">
              <h2 id="home-theory">理论与制度</h2>
              <p>让政治方向，有可以检验的制度基础。</p>
            </div>
            <div class="theory-grid">
              <article>
                <h3>公民秩序主义</h3>
                <p>理解政治路线、转轨逻辑与整体方案。</p>
                <a class="link" href="/civic-orderism">
                  阅读路线总论
                </a>
              </article>
              <article>
                <h3>政治制度设计</h3>
                <p>从原则走向制度安排与治理结构。</p>
                <a class="link" href="/institution-design">
                  浏览制度设计
                </a>
              </article>
              <article>
                <h3>国家连续性与责任</h3>
                <p>在规则、授权与责任中维持公共秩序。</p>
                <a class="link" href="/institutional-architecture">
                  理解制度架构
                </a>
              </article>
            </div>
          </div>
        </section>
        <section
          class="organization band"
          id="organization"
          aria-labelledby="home-organization"
        >
          <div class="wrap organization-grid">
            <div>
              <h2 id="home-organization">组织建设与公开责任</h2>
              <h3>北美非营利法人及首届董事会筹备</h3>
              <p>
                公民秩序主义目前处于组织筹备阶段，尚未完成法人注册及首届董事会设立，也不以政党身份运行。
              </p>
              <div class="org-actions">
                <a class="outline" href="/preparation">
                  了解组织筹备
                </a>
                <a class="link" href={site.documents[0].href}>
                  阅读正式筹备文件 PDF
                </a>
              </div>
            </div>
            <aside class="responsibility">
              <h3>发起人的公开责任</h3>
              <p>
                我决定公开站出来，为这条路线承担责任，也接受社会对它的检验。
              </p>
              <span>赵鹏博</span>
              <a class="link" href="/about/initiator">
                阅读发起人说明
              </a>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};
OfficialHome.css = style;
export default (() => OfficialHome) satisfies QuartzComponentConstructor;
