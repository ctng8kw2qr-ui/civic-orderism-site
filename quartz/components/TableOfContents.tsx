import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import legacyStyle from "./styles/legacyToc.scss";
import modernStyle from "./styles/toc.scss";

// @ts-ignore
import script from "./scripts/toc.inline";
import { i18n } from "../i18n";
import OverflowListFactory from "./OverflowList";
import { concatenateResources } from "../util/resources";
import { isArticleSlug } from "../util/articlePage";

interface Options {
  layout: "modern" | "legacy";
}

const defaultOptions: Options = {
  layout: "modern",
};

function tocEntryText(
  fileData: QuartzComponentProps["fileData"],
  text: string,
) {
  return isArticleSlug(fileData.slug) && text.trim() === "核心判断"
    ? "重点句"
    : text;
}

let numTocs = 0;
export default ((opts?: Partial<Options>) => {
  const layout = opts?.layout ?? defaultOptions.layout;
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory();
  const TableOfContents: QuartzComponent = ({
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    if (!fileData.toc) {
      return null;
    }

    const id = `toc-${numTocs++}`;
    const responsiveClass =
      displayClass === "mobile-only"
        ? "toc-mobile"
        : displayClass === "desktop-only"
          ? "toc-desktop"
          : "toc-article";
    const title =
      responsiveClass === "toc-article" || responsiveClass === "toc-desktop"
        ? "本文目录"
        : i18n(cfg.locale).components.tableOfContents.title;
    const initiallyCollapsed =
      fileData.collapseToc || responsiveClass !== "toc-desktop";
    return (
      <div class={["toc", responsiveClass].filter(Boolean).join(" ")}>
        <button
          type="button"
          class={initiallyCollapsed ? "collapsed toc-header" : "toc-header"}
          aria-controls={id}
          aria-expanded={!initiallyCollapsed}
        >
          <h3>{title}</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <OverflowList
          id={id}
          class={initiallyCollapsed ? "collapsed toc-content" : "toc-content"}
        >
          {fileData.toc.map((tocEntry) => (
            <li key={tocEntry.slug} class={`depth-${tocEntry.depth}`}>
              <a href={`#${tocEntry.slug}`} data-for={tocEntry.slug}>
                {tocEntryText(fileData, tocEntry.text)}
              </a>
            </li>
          ))}
        </OverflowList>
      </div>
    );
  };

  TableOfContents.css = modernStyle;
  TableOfContents.afterDOMLoaded = concatenateResources(
    script,
    overflowListAfterDOMLoaded,
  );

  const LegacyTableOfContents: QuartzComponent = ({
    fileData,
    cfg,
  }: QuartzComponentProps) => {
    if (!fileData.toc) {
      return null;
    }
    return (
      <details class="toc" open={!fileData.collapseToc}>
        <summary>
          <h3>{i18n(cfg.locale).components.tableOfContents.title}</h3>
        </summary>
        <ul>
          {fileData.toc.map((tocEntry) => (
            <li key={tocEntry.slug} class={`depth-${tocEntry.depth}`}>
              <a href={`#${tocEntry.slug}`} data-for={tocEntry.slug}>
                {tocEntryText(fileData, tocEntry.text)}
              </a>
            </li>
          ))}
        </ul>
      </details>
    );
  };
  LegacyTableOfContents.css = legacyStyle;

  return layout === "modern" ? TableOfContents : LegacyTableOfContents;
}) satisfies QuartzComponentConstructor;
