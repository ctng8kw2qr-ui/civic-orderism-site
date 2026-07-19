import navigation from "../../data/navigation.config.json";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/primaryNavigation.scss";
// @ts-ignore
import script from "./scripts/primaryNavigation.inline";

const secondaryNavigation = [
  { label: "开始阅读", href: "/start" },
  { label: "专题", href: "/topics" },
  { label: "核心概念", href: "/concepts" },
  { label: "全部文章", href: "/articles" },
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
      <a
        class="primary-navigation__brand"
        href="/"
        aria-label="公民秩序主义首页"
      >
        公民秩序主义
      </a>
      <button
        class="primary-navigation__toggle"
        type="button"
        aria-expanded="false"
        aria-controls="primary-navigation-links"
      >
        <span>导航</span>
        <span aria-hidden="true">☰</span>
      </button>
      <div class="primary-navigation__links" id="primary-navigation-links">
        {navigation.map((item) => {
          return (
            <a
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </a>
          );
        })}
        <div class="primary-navigation__secondary" aria-label="次级导航">
          {secondaryNavigation.map((item) => (
            <a
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
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
