import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/search.scss";
// @ts-ignore
import script from "./scripts/search.inline";
import { classNames } from "../util/lang";
import { i18n } from "../i18n";

export interface SearchOptions {
  enablePreview: boolean;
}

const defaultOptions: SearchOptions = {
  enablePreview: true,
};

export default ((userOpts?: Partial<SearchOptions>) => {
  const Search: QuartzComponent = ({
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts };
    const searchPlaceholder = i18n(cfg.locale).components.search
      .searchBarPlaceholder;
    return (
      <div class={classNames(displayClass, "search")}>
        <button class="search-button">
          {/* Unified icon system: the magnifier is drawn on the shared 24 grid
              with an 18px render, round caps and joins, and a 1.5 stroke — the
              same language as every other icon. Colouring comes from
              currentColor, so it follows the V6 nav token rather than the
              legacy theme token it used before. */}
          <svg
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <title>Search</title>
            <g class="search-path" fill="none">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.2 16.2 21 21" />
            </g>
          </svg>
          <p>{i18n(cfg.locale).components.search.title}</p>
        </button>
        <div class="search-container">
          <div class="search-space">
            <input
              autocomplete="off"
              class="search-bar"
              name="search"
              type="text"
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
            />
            <div class="search-layout" data-preview={opts.enablePreview}></div>
          </div>
        </div>
      </div>
    );
  };

  Search.afterDOMLoaded = script;
  Search.css = style;

  return Search;
}) satisfies QuartzComponentConstructor;
