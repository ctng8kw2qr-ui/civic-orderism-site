import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/v6Navigation.scss";
// @ts-ignore
import script from "./scripts/v6Navigation.inline";

/**
 * V6 — Institutional Editorial · Primary Navigation
 *
 * 只保留长期入口：首页 / 研究 / 政治路线 / 组织建设 / 关于。
 * 组织建设保持指向既有 URL /preparation，不做 URL 迁移。
 * 董事会筹备属于组织建设内部项目，从该页与页脚进入，不再占用一级入口。
 */
const navItems = [
  { label: "首页", href: "/" },
  { label: "研究", href: "/theory" },
  { label: "政治路线", href: "/civic-orderism" },
  { label: "组织建设", href: "/preparation" },
  { label: "关于", href: "/about" },
];

// 研究入口涵盖的全部栏目：用于在任意研究子页上保持高亮。
const researchSlugs = [
  "theory",
  "china",
  "china-future",
  "china-stage",
  "topics",
  "concepts",
  "articles",
  "institution",
  "institution-design",
];

const PrimaryNavigation: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const slug = (fileData.slug ?? "").replace(/\/index$/, "");

  const isActive = (href: string): boolean => {
    if (href === "/") return slug === "index" || slug === "";
    const target = href.replace(/^\//, "").replace(/\/$/, "");
    if (target === "theory") {
      return researchSlugs.some(
        (entry) => slug === entry || slug.startsWith(`${entry}/`),
      );
    }
    return slug === target || slug.startsWith(`${target}/`);
  };

  return (
    <nav class="v6-nav" aria-label="主要导航">
      <div class="v6-nav__inner">
        <a
          class="v6-nav__brand"
          href="/"
          data-router-ignore
          aria-label="公民秩序主义首页"
        >
          {/* Header wordmark. The Threshold Mark was removed from the header as
              a display decision, and the browser/bookmark/home-screen icons now
              use the separate slate icon mark (`brand/icon-mark.svg`) — the
              Threshold Mark still serves the OG fallback. See
              quartz/static/assets/v6/SPEC.md §1b.

              What remains is the name alone, in real text, inside this single
              link so the whole wordmark is one home click target. The
              accessible name comes from the text and the link's aria-label. */}
          <span class="v6-nav__brand-zh">公民秩序主义</span>
          {/* Formal institutional English identifier. Always uppercase —
              it matches the V6 uppercase micro-label / tracking language.
              Prose uses of "Civic Orderism" in content are left untouched. */}
          <span class="v6-nav__brand-en" lang="en">
            CIVIC ORDERISM
          </span>
        </a>

        <button
          class="v6-nav__toggle"
          type="button"
          aria-label="打开导航"
          aria-expanded="false"
          aria-controls="v6-nav-links"
        >
          <span class="v6-nav__toggle-bars" aria-hidden="true" />
        </button>

        <div class="v6-nav__links" id="v6-nav-links">
          {navItems.map((item) => (
            <a
              class="v6-nav__link"
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
          <button
            class="v6-nav__search"
            type="button"
            data-inst4-search
            aria-label="打开搜索"
          >
            搜索
          </button>
        </div>
      </div>
    </nav>
  );
};

PrimaryNavigation.css = style;
PrimaryNavigation.afterDOMLoaded = script;

export default (() => PrimaryNavigation) satisfies QuartzComponentConstructor;
