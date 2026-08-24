const DESKTOP_QUERY = "(min-width: 801px)";
const desktopMedia = window.matchMedia(DESKTOP_QUERY);

function relocateTableOfContents() {
  if (document.body.getAttribute("data-article-type") !== "institutional") {
    return;
  }
  // The Institutional template renders exactly one TOC instance (before the
  // body). Desktop relocates it into the right rail as the sticky rail;
  // Mobile keeps it as the folded「本文目录」below the Core Judgment.
  const toc = document.querySelector(
    "body[data-article-type='institutional'] .toc-article, body[data-article-type='institutional'] .toc-desktop",
  );
  if (!toc) return;
  const right = document.querySelector(".right.sidebar");
  const isDesktop = desktopMedia.matches;

  if (isDesktop && right && toc.parentElement !== right) {
    toc.classList.remove("toc-article");
    toc.classList.add("toc-desktop");
    right.appendChild(toc);
  } else if (!isDesktop && right && toc.parentElement === right) {
    toc.classList.remove("toc-desktop");
    toc.classList.add("toc-article");
    const anchor =
      document.querySelector(".article-inst-judgment") ??
      document.querySelector(".article-inst");
    if (anchor) {
      anchor.after(toc);
    } else {
      document
        .querySelector(".page-header .popover-hint")
        ?.appendChild(toc);
    }
  }
}

function setupInstitutionalArticle() {
  if (document.body.getAttribute("data-article-type") !== "institutional") {
    return;
  }

  relocateTableOfContents();

  // When the Institutional Header already rendered a Deck, the subtitle
  // paragraph inside the article body must not repeat it (single source).
  if (document.querySelector(".article-inst__deck")) {
    document
      .querySelectorAll("article.article-page .article-content p.subtitle")
      .forEach((element) => element.remove());
  }

  // Key Sentences: only `> **重点句**：` blockquotes. Restructure them into
  // the Key Sentence component (label + body) instead of a raw blockquote.
  // Other blockquotes (quotes, core-judgment statements) keep quote styling.
  document
    .querySelectorAll("article.article-page .article-content blockquote")
    .forEach((blockquote) => {
      const firstChild = blockquote.firstElementChild;
      const firstStrong = firstChild?.querySelector("strong");
      const label = firstStrong?.textContent?.trim() ?? "";
      if (!label.startsWith("重点句")) return;
      if (!firstStrong || !firstChild) return;
      if (blockquote.classList.contains("key-sentence")) return;

      blockquote.classList.add("key-sentence");

      const bodyText = firstStrong.nextSibling?.textContent ?? "";
      const cleanBody = bodyText.replace(/^[：:]\s*/, "");
      firstStrong.remove();

      const labelElement = document.createElement("span");
      labelElement.className = "key-sentence__label";
      labelElement.textContent = "重点句";

      const bodyElement = document.createElement("p");
      bodyElement.className = "key-sentence__body";
      bodyElement.textContent = cleanBody;

      firstChild.replaceChildren(labelElement, bodyElement);
    });
}

document.addEventListener("nav", setupInstitutionalArticle);
desktopMedia.addEventListener("change", () => {
  if (document.body.getAttribute("data-article-type") === "institutional") {
    relocateTableOfContents();
  }
});
setupInstitutionalArticle();

