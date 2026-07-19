import { i18n } from "../i18n";
import { getFileExtension, joinSegments, simplifySlug } from "../util/path";
import {
  CSSResourceToStyleElement,
  JSResourceToScriptElement,
} from "../util/resources";
import { googleFontHref, googleFontSubsetHref } from "../util/theme";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import { unescapeHTML } from "../util/escape";
import { CustomOgImagesEmitterName } from "../plugins/emitters/ogImage";

const siteDescription =
  "公民秩序主义关注工业时代旧秩序在信息化时代的失效，并尝试提出一种面向中国现实、可进入、可解释、可纠错、可追责的公共秩序方案。";

export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? "";
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) +
      titleSuffix;
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() || siteDescription);

    const { css, js, additionalHead } = externalResources;

    const siteBase = `https://${cfg.baseUrl ?? "example.com"}`;
    const url = new URL(siteBase);

    // Url of current page
    const canonicalUrl =
      fileData.slug === "404"
        ? url.toString()
        : joinSegments(siteBase, encodeURI(simplifySlug(fileData.slug!)));

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    );
    const ogImageDefaultPath = `https://${cfg.baseUrl}/og-image.png`;
    const slug = fileData.slug!;
    const shouldNoIndex =
      slug.startsWith("tags/") ||
      fileData.frontmatter?.noindex === true ||
      fileData.frontmatter?.published === false;
    const articlePrefixes = [
      "theory/",
      "china/",
      "china-stage/",
      "civic-orderism/",
      "institution/",
    ];
    const isArticle =
      !slug.endsWith("/index") &&
      articlePrefixes.some((prefix) => slug.startsWith(prefix));
    const contentType = String(fileData.frontmatter?.contentType ?? "页面");
    const published = fileData.dates?.published?.toISOString();
    const modified = fileData.dates?.modified?.toISOString() ?? published;
    const breadcrumbParts = simplifySlug(slug).split("/").filter(Boolean);
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首页", item: siteBase },
        ...breadcrumbParts.map((part, index) => ({
          "@type": "ListItem",
          position: index + 2,
          name:
            index === breadcrumbParts.length - 1
              ? title.replace(titleSuffix, "")
              : decodeURI(part),
          item: joinSegments(
            siteBase,
            encodeURI(breadcrumbParts.slice(0, index + 1).join("/")),
          ),
        })),
      ],
    };
    const pageJsonLd = isArticle
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title.replace(titleSuffix, ""),
          description,
          datePublished: published,
          dateModified: modified,
          inLanguage: "zh-CN",
          author: { "@type": "Organization", name: "公民秩序主义" },
          publisher: { "@type": "Organization", name: "公民秩序主义" },
          mainEntityOfPage: canonicalUrl,
        }
      : [
            "栏目",
            "专题",
            "专题索引",
            "核心概念",
            "概念索引",
            "阅读路径",
          ].includes(contentType)
        ? {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title.replace(titleSuffix, ""),
            description,
            inLanguage: "zh-CN",
            url: canonicalUrl,
          }
        : undefined;

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link
                rel="stylesheet"
                href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)}
              />
            )}
          </>
        )}
        <link
          rel="preconnect"
          href="https://cdnjs.cloudflare.com"
          crossOrigin="anonymous"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta property="og:locale" content="zh_CN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${(getFileExtension(ogImageDefaultPath) ?? "png").replace(/^\./, "")}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={canonicalUrl}></meta>
            <meta property="twitter:url" content={canonicalUrl}></meta>
          </>
        )}

        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png?v=2"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png?v=2"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png?v=2"
        />
        <link rel="manifest" href="/site.webmanifest?v=2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="公民秩序主义" />
        <meta name="theme-color" content="#f8f8f6" />

        {fileData.slug !== "404" && (
          <link rel="canonical" href={canonicalUrl} />
        )}
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />
        {shouldNoIndex && <meta name="robots" content="noindex,follow" />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {pageJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
          />
        ) : null}

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData);
          } else {
            return resource;
          }
        })}
      </head>
    );
  };

  return Head;
}) satisfies QuartzComponentConstructor;
