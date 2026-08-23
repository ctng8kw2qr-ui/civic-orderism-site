import navigation from "../../data/navigation.config.json";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/primaryNavigation.scss";
// @ts-ignore
import script from "./scripts/primaryNavigation.inline";

const researchSubLinks = [
  { label: "解析中共", href: "/china" },
  { label: "中国未来", href: "/china-future" },
  { label: "专题", href: "/topics" },
  { label: "核心概念", href: "/concepts" },
];

const furtherReadingLinks = [
  { label: "5分钟了解", href: "/start-here" },
  { label: "阅读地图", href: "/articles" },
];

const PrimaryNavigation: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const slug = fileData.slug ?? "";
  const isActive = (href: string) => {
    const target = href.replace(/^\//, "");
    return href === "/"
      ? slug === "index"
      : slug === target || slug.startsWith(`${target}/`);
  };

  return (
    <nav class="primary-navigation" aria-label="主要导航">
      <button
        class="primary-navigation__toggle"
        type="button"
        aria-label="打开导航"
        aria-expanded="false"
        aria-controls="primary-navigation-links"
      >
        <span class="primary-navigation__toggle-label">导航</span>
        <span
          class="primary-navigation__toggle-icon primary-navigation__toggle-icon--menu"
          aria-hidden="true"
        >
          ☰
        </span>
        <span
          class="primary-navigation__toggle-icon primary-navigation__toggle-icon--close"
          aria-hidden="true"
        >
          ×
        </span>
      </button>
      <a
        class="primary-navigation__brand"
        href="/"
        aria-label="公民秩序主义首页"
      >
        公民秩序主义
      </a>
      <div class="primary-navigation__links" id="primary-navigation-links">
        {navigation.map((item) => {
          if (item.href === "/theory") {
            return (
              <div
                class="primary-navigation__item"
                data-submenu
                aria-expanded="false"
              >
                <a
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </a>
                <button
                  class="primary-navigation__submenu-toggle"
                  type="button"
                  aria-label="展开理论研究子菜单"
                  aria-expanded="false"
                >
                  <span aria-hidden="true">+</span>
                </button>
                <div class="primary-navigation__submenu">
                  {researchSubLinks.map((link) => (
                    <a
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <a
              href={item.href}
              class={
                item.href === "/preparation"
                  ? "primary-navigation__priority"
                  : undefined
              }
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </a>
          );
        })}
        <div class="primary-navigation__further">
          <span>进一步阅读</span>
          {furtherReadingLinks.map((link) => (
            <a
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

PrimaryNavigation.css = style;
PrimaryNavigation.afterDOMLoaded = script;

export default (() => PrimaryNavigation) satisfies QuartzComponentConstructor;
