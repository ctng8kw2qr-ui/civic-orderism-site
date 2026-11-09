import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/v6Navigation.scss";
// @ts-ignore
import script from "./scripts/v6Navigation.inline";
// @ts-ignore — reuse Quartz system-theme initialization without adding a control.
import themeScript from "./scripts/darkmode.inline";

/**
 * V6 — Institutional Editorial · Primary Navigation
 *
 * 保留正式内容 URL，按已批准的政治路线 / 观察 / 理论 / 人物 / 组织排序。
 * 组织建设保持指向既有 URL /preparation，不做 URL 迁移。
 * 董事会筹备属于组织建设内部项目，从该页与页脚进入，不再占用一级入口。
 */
const navItems = [
  { label: "政治路线", href: "/civic-orderism" },
  { label: "政治经济观察", href: "/china" },
  { label: "理论与制度", href: "/theory" },
  { label: "关于赵鹏博", href: "/about/initiator" },
  { label: "组织建设", href: "/preparation" },
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
      if (slug === "china" || slug.startsWith("china/")) return false;
      return researchSlugs.some(
        (entry) => slug === entry || slug.startsWith(`${entry}/`),
      );
    }
    return slug === target || slug.startsWith(`${target}/`);
  };

  return (
    <nav class="v6-nav" aria-label="主要导航">
      <a class="v6-nav__skip" href="#main-content" data-router-ignore>
        跳至主要内容
      </a>
      <div class="v6-nav__inner">
        <a
          class="v6-nav__brand"
          href="/"
          data-router-ignore
          aria-label="公民秩序主义 CIVIC ORDERISM 首页"
        >
          {/* Existing approved geometric Icon Mark; no new brand asset. */}
          <img
            class="v6-nav__mark"
            src="/static/assets/v6/brand/icon-mark.svg"
            width="32"
            height="32"
            alt=""
          />
          <span class="v6-nav__brand-copy">
            <span class="v6-nav__brand-zh">公民秩序主义</span>
            {/* Formal institutional English identifier. Always uppercase —
              it matches the V6 uppercase micro-label / tracking language.
              Prose uses of "Civic Orderism" in content are left untouched. */}
            <span class="v6-nav__brand-en" lang="en" translate={false}>
              CIVIC ORDERISM
            </span>
          </span>
        </a>

        <button
          class="v6-nav__toggle"
          type="button"
          aria-label="打开导航"
          aria-expanded="false"
          aria-controls="v6-nav-links"
        >
          菜单
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
PrimaryNavigation.beforeDOMLoaded = themeScript;

export default (() => PrimaryNavigation) satisfies QuartzComponentConstructor;
