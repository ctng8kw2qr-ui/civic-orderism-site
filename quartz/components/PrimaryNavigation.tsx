import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/primaryNavigation.scss";
// @ts-ignore
import script from "./scripts/primaryNavigation.inline";

const navItems = [
  { label: "关于", href: "/about" },
  { label: "研究", href: "/theory" },
  { label: "政治路线", href: "/civic-orderism" },
  { label: "董事会筹备", href: "/preparation" },
];

const researchMenuLinks = [
  { label: "解析中共", href: "/china/" },
  { label: "中国未来", href: "/china-future/" },
  { label: "专题", href: "/topics/" },
  { label: "核心概念", href: "/concepts/" },
];

const resourceMenuLinks = [
  { label: "5分钟了解", href: "/start-here/" },
  { label: "阅读地图", href: "/articles/" },
];

const PrimaryNavigation: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const slug = fileData.slug ?? "";
  const isActive = (href: string) => {
    const target = href.replace(/^\//, "");
    if (href === "/") return slug === "index";
    if (target === "about") return slug === "about";
    if (target === "theory") {
      return (
        slug === "theory" ||
        slug.startsWith("theory/") ||
        slug === "china" ||
        slug.startsWith("china/") ||
        slug === "china-future" ||
        slug.startsWith("china-future/") ||
        slug === "china-stage" ||
        slug.startsWith("china-stage/") ||
        slug === "topics" ||
        slug.startsWith("topics/") ||
        slug === "concepts" ||
        slug.startsWith("concepts/") ||
        slug === "articles" ||
        slug.startsWith("articles/") ||
        slug === "institution" ||
        slug.startsWith("institution/") ||
        slug === "institution-design" ||
        slug.startsWith("institution-design/")
      );
    }
    if (target === "civic-orderism") {
      return (
        slug === "civic-orderism" ||
        slug === "civic-orderism/index" ||
        slug.startsWith("civic-orderism/")
      );
    }
    if (target === "preparation") {
      return (
        slug === "preparation" ||
        slug === "preparation/index" ||
        slug.startsWith("preparation/")
      );
    }
    return slug === target || slug.startsWith(`${target}/`);
  };

  return (
    <nav class="inst4-nav" aria-label="主要导航">
      <a class="inst4-nav__brand" href="/" aria-label="Civic Orderism 首页">
        Civic Orderism
      </a>
      <button
        class="inst4-nav__toggle"
        type="button"
        aria-label="打开导航"
        aria-expanded="false"
        aria-controls="inst4-nav-links"
      >
        <span class="inst4-nav__toggle-icon" aria-hidden="true">
          菜单
        </span>
      </button>
      <div class="inst4-nav__links" id="inst4-nav-links">
        {navItems.map((item) => (
          <a
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
        <div class="inst4-nav__groups">
          <div class="inst4-nav__group">
            <span>RESEARCH</span>
            {researchMenuLinks.map((link) => (
              <a
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div class="inst4-nav__group">
            <span>RESOURCES</span>
            {resourceMenuLinks.map((link) => (
              <a
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <button
          class="inst4-nav__search"
          type="button"
          data-inst4-search
          aria-label="打开搜索"
        >
          搜索
        </button>
      </div>
    </nav>
  );
};

PrimaryNavigation.css = style;
PrimaryNavigation.afterDOMLoaded = script;

export default (() => PrimaryNavigation) satisfies QuartzComponentConstructor;
