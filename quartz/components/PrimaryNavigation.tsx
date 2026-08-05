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
  { label: "5分钟了解", href: "/start" },
  {
    label: "中国和平政治转型",
    href: "/civic-orderism/possibility-of-peaceful-political-transition-in-china",
  },
  { label: "组织筹备", href: "/preparation" },
  { label: "参与方式", href: "/participate" },
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
