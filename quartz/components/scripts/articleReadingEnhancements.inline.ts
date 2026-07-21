function getArticleScrollProgress() {
  const article = document.querySelector("article");
  if (!article) return 0;

  const rect = article.getBoundingClientRect();
  const articleTop = window.scrollY + rect.top;
  const articleHeight = article.scrollHeight;
  const viewportHeight = window.innerHeight;
  const readableDistance = Math.max(articleHeight - viewportHeight * 0.65, 1);
  return Math.min(
    Math.max((window.scrollY - articleTop) / readableDistance, 0),
    1,
  );
}

function updateReadingProgress() {
  const progress = document.querySelector<HTMLElement>(
    ".article-reading-progress",
  );
  if (!progress) return;
  progress.style.transform = `scaleX(${getArticleScrollProgress()})`;
}

function getCopyText(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(".key-judgment-copy")
    .forEach((button) => button.remove());
  const explicitContent = clone.querySelector<HTMLElement>(".callout-content");
  return (explicitContent ?? clone).textContent?.trim() ?? "";
}

async function copyKeyJudgment(event: Event) {
  const button = event.currentTarget as HTMLButtonElement;
  const container = button.closest<HTMLElement>(".key-judgment");
  if (!container) return;

  const text = getCopyText(container);
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "已复制";
    window.setTimeout(() => {
      button.textContent = "复制";
    }, 1500);
  } catch {
    button.textContent = "复制失败";
    window.setTimeout(() => {
      button.textContent = "复制";
    }, 1500);
  }
}

function isStrongOnlyParagraph(paragraph: HTMLParagraphElement) {
  if (
    paragraph.closest(
      ".article-core-judgments, .article-ending-cta, [data-callout='key-point']",
    )
  )
    return false;
  const strongText = Array.from(paragraph.querySelectorAll("strong"))
    .map((strong) => strong.textContent?.trim() ?? "")
    .join("");
  const paragraphText = paragraph.textContent?.trim() ?? "";
  return strongText.length > 0 && strongText === paragraphText;
}

function setupKeyJudgments() {
  const explicitJudgments = document.querySelectorAll<HTMLElement>(
    "article blockquote[data-callout='key-point']",
  );
  explicitJudgments.forEach((judgment) => {
    judgment.classList.add("key-judgment", "key-judgment--explicit");
  });

  const paragraphs =
    document.querySelectorAll<HTMLParagraphElement>("article p");
  paragraphs.forEach((paragraph) => {
    if (isStrongOnlyParagraph(paragraph)) {
      paragraph.classList.add("key-judgment");
    }
  });

  const judgments = document.querySelectorAll<HTMLElement>(".key-judgment");
  judgments.forEach((judgment) => {
    if (judgment.querySelector(".key-judgment-copy")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "key-judgment-copy";
    button.textContent = "复制";
    button.setAttribute("aria-label", "复制重点句");
    button.addEventListener("click", copyKeyJudgment);
    window.addCleanup(() =>
      button.removeEventListener("click", copyKeyJudgment),
    );
    judgment.append(button);
  });
}

document.addEventListener("nav", () => {
  setupKeyJudgments();
  updateReadingProgress();
  document.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);
  window.addCleanup(() =>
    document.removeEventListener("scroll", updateReadingProgress),
  );
  window.addCleanup(() =>
    window.removeEventListener("resize", updateReadingProgress),
  );
});
