import { QuartzConfig } from "./quartz/cfg";
import * as Plugin from "./quartz/plugins";
import { RootStatic } from "./quartz/plugins/emitters/rootStatic";

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "公民秩序主义",
    pageTitleSuffix: " · CIVIC ORDERISM",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "zh-CN",
    baseUrl: "civicorderism.com",
    ignorePatterns: [
      "private",
      "templates",
      ".obsidian",
      "**/未命名.md",
      "**/Untitled.md",
      "**/untitled.md",
      "**/* 2.md",
      "**/* 2.mdx",
      "**/* 2.html",
      "article_priority_index.md",
      "article_summaries.md",
      "articles.md.backup",
    ],
    defaultDateType: "published",
    theme: {
      fontOrigin: "local",
      cdnCaching: false,
      typography: {
        header: "system-ui",
        body: "system-ui",
        code: "ui-monospace",
      },
      colors: {
        lightMode: {
          light: "#f7f8fa",
          lightgray: "#dbe1e8",
          gray: "#7d8794",
          darkgray: "#465260",
          dark: "#14253a",
          secondary: "#0a1d38",
          tertiary: "#9b7c3e",
          highlight: "rgba(10, 29, 56, 0.07)",
          textHighlight: "rgba(181, 154, 99, 0.20)",
        },
        darkMode: {
          light: "#111111",
          lightgray: "#2a2a28",
          gray: "#7b7972",
          darkgray: "#d0cec7",
          dark: "#f4f3ef",
          secondary: "#e0ded7",
          tertiary: "#aaa69b",
          highlight: "rgba(244, 243, 239, 0.08)",
          textHighlight: "rgba(244, 243, 239, 0.12)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.CNAME(),
      Plugin.Robots(),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      RootStatic(),
      Plugin.NotFoundPage(),
    ],
  },
};

export default config;
