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
import navigation from "../../data/navigation.config.json";
import migrationMap from "../../content-migration-map.json";
import contentMap from "../../data/phase2-content-map.json";

/**
 * V6 — Institutional Editorial · Primary Navigation
 *
 * 保留正式内容 URL，按已批准的政治路线 / 观察 / 理论 / 人物 / 组织排序。
 * 组织建设保持指向既有 URL /preparation，不做 URL 迁移。
 * 董事会筹备属于组织建设内部项目，从该页与页脚进入，不再占用一级入口。
 */
const navItems = navigation.primary;
const articleSectionNav = navigation.articleSectionNav as Record<
  string,
  string
>;
const migrationBySlug = new Map(
  (migrationMap as Array<{ slug: string; section?: string }>).map((entry) => [
    entry.slug,
    entry,
  ]),
);
const contentBySlug = new Map(
  (
    contentMap.articles as Array<{ slug: string; primary_section?: string }>
  ).map((entry) => [entry.slug, entry]),
);

const PrimaryNavigation: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const slug = (fileData.slug ?? "").replace(/\/index$/, "");

  const isActive = (href: string): boolean => {
    const item = navItems.find((entry) => entry.href === href);
    if (!item) return false;

    // 文章按最终内容归属（phase2/3 内容映射）高亮，而不是按历史 URL 前缀。
    // 这保证第三阶段重新归类的理论文章高亮“理论与制度”。
    const primary = contentBySlug.get(slug)?.primary_section;
    const primaryHref: Record<string, string> = {
      政治路线: "/civic-orderism/",
      政治经济观察: "/china/",
      理论与制度: "/theory/",
    };
    if (primary && primaryHref[primary]) return primaryHref[primary] === href;

    // 非文章页面 / 旧数据回退。
    const section = migrationBySlug.get(slug)?.section;
    if (section && articleSectionNav[section])
      return articleSectionNav[section] === href;

    return item.match.some(
      (entry) => slug === entry || slug.startsWith(`${entry}/`),
    );
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
          aria-label="菜单：打开导航"
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
