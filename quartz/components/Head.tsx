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
import {
  absoluteCoverUrl,
  resolveCover,
  FALLBACK_OG_HEIGHT,
  FALLBACK_OG_IMAGE,
  FALLBACK_OG_WIDTH,
} from "../util/cover";

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
    // ── Social image precedence (Phase 3) ────────────────────────────
    //   1. article has `cover`  -> that cover, as an absolute URL
    //   2. otherwise            -> the single branded fallback
    // Reuses cfg.baseUrl (quartz.config.ts configuration.baseUrl), so the
    // origin is configured in one place and never hardcoded per component.
    // Homepage identity card is independent of its in-page editorial cover.
    // Other pages keep the existing cover/fallback contract unchanged.
    const homepageSocialImage =
      fileData.slug === "index" ? fileData.frontmatter?.socialImage : undefined;
    const cover = homepageSocialImage
      ? resolveCover({
          ...fileData,
          frontmatter: {
            ...fileData.frontmatter,
            title: fileData.frontmatter?.title ?? "",
            cover: homepageSocialImage,
            coverAlt:
              "公民秩序主义 · CIVIC ORDERISM · 中国和平政治转轨与制度承接",
          },
        })
      : resolveCover(fileData);
    const coverOgUrl = absoluteCoverUrl(cfg, cover);
    const ogImagePath =
      coverOgUrl ??
      `https://${(cfg.baseUrl ?? "").replace(/\/+$/, "")}${FALLBACK_OG_IMAGE}`;
    const ogImageAlt = coverOgUrl && cover.alt ? cover.alt : description;
    // Dimensions are known for the homepage card and branded fallback.
    // Cover dimensions are editor-supplied and not resolvable at build time, so
    // we omit them there rather than assert values we cannot verify.
    const ogImageWidth = homepageSocialImage
      ? 1600
      : coverOgUrl
        ? undefined
        : FALLBACK_OG_WIDTH;
    const ogImageHeight = homepageSocialImage
      ? 840
      : coverOgUrl
        ? undefined
        : FALLBACK_OG_HEIGHT;
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
    const isCorePoliticalStatement =
      fileData.frontmatter?.corePoliticalStatement === true;
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
          articleSection: isCorePoliticalStatement
            ? "Core Political Statement"
            : contentType,
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
        : {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title.replace(titleSuffix, ""),
            description,
            inLanguage: "zh-CN",
            url: canonicalUrl,
            // Machine-readable dates for non-article pages (e.g. the homepage):
            // publication date plus the editorial update date when declared.
            datePublished: published,
            dateModified: modified,
          };

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
        <meta property="og:image:alt" content={ogImageAlt} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImagePath} />
            <meta property="og:image:url" content={ogImagePath} />
            <meta name="twitter:image" content={ogImagePath} />
            <meta
              property="og:image:type"
              content={`image/${(getFileExtension(ogImagePath) ?? "png").replace(/^\./, "")}`}
            />
            {ogImageWidth !== undefined && ogImageHeight !== undefined ? (
              <>
                <meta
                  property="og:image:width"
                  content={String(ogImageWidth)}
                />
                <meta
                  property="og:image:height"
                  content={String(ogImageHeight)}
                />
              </>
            ) : null}
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={canonicalUrl}></meta>
            <meta property="twitter:url" content={canonicalUrl}></meta>
          </>
        )}

        {/* Website icons, all declared from a unique version directory so every
            icon URL is a path Safari has never stored. A version query on the
            old filenames was not enough: Safari's touch-icon and favicon stores
            are keyed by URL it has seen, and it also probes the conventional
            root paths on its own.

            The canonical root files (/favicon.ico, /apple-touch-icon.png, …)
            are still published with the same mark, so those speculative probes
            are answered with the current icon rather than a 404. Keep both in
            sync whenever the mark changes. */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="/static/assets/v6/brand/icons-e7b4c91a/icon-mark.svg"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href="/static/assets/v6/brand/icons-e7b4c91a/icon-mark.ico"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/static/assets/v6/brand/icons-e7b4c91a/icon-mark-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/static/assets/v6/brand/icons-e7b4c91a/icon-mark-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/static/assets/v6/brand/icons-e7b4c91a/icon-mark-180x180.png"
        />
        <link
          rel="manifest"
          href="/static/assets/v6/brand/icons-e7b4c91a/site-icons.webmanifest"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="公民秩序主义" />
        {/* Browser chrome colour follows the page background token in both
            schemes (previously a single hardcoded #f8f8f6 that matched
            neither the light nor the dark page background). */}
        <meta
          name="theme-color"
          content="#faf8f5"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#141518"
          media="(prefers-color-scheme: dark)"
        />

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
