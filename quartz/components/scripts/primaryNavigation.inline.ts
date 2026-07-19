function setupPrimaryNavigation() {
  for (const nav of document.querySelectorAll<HTMLElement>(
    ".primary-navigation",
  )) {
    const toggle = nav.querySelector<HTMLButtonElement>(
      ".primary-navigation__toggle",
    );
    if (!toggle || toggle.dataset.bound === "true") continue;
    toggle.dataset.bound = "true";

    const setOpen = (open: boolean) => {
      nav.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    };
    const onClick = () => {
      setOpen(nav.dataset.open !== "true");
    };
    const onOutsidePointer = (event: PointerEvent) => {
      if (nav.dataset.open === "true" && !nav.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || nav.dataset.open !== "true") return;
      event.preventDefault();
      setOpen(false);
      requestAnimationFrame(() => toggle.focus());
    };
    const onLinkClick = () => setOpen(false);
    const links = nav.querySelectorAll<HTMLAnchorElement>(
      ".primary-navigation__links a",
    );

    toggle.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onKeyDown);
    links.forEach((link) => link.addEventListener("click", onLinkClick));
    window.addCleanup(() => {
      toggle.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onKeyDown);
      links.forEach((link) => link.removeEventListener("click", onLinkClick));
    });
  }

  for (const browser of document.querySelectorAll<HTMLElement>(
    "[data-knowledge-browser]",
  )) {
    if (browser.dataset.bound === "true") continue;
    browser.dataset.bound = "true";
    const cards = [
      ...browser.querySelectorAll<HTMLElement>("[data-knowledge-card]"),
    ];
    const topic = browser.querySelector<HTMLSelectElement>(
      "[data-filter-topic]",
    );
    const concept = browser.querySelector<HTMLSelectElement>(
      "[data-filter-concept]",
    );
    const reset = browser.querySelector<HTMLButtonElement>(
      "[data-filter-reset]",
    );
    const previous =
      browser.querySelector<HTMLButtonElement>("[data-page-prev]");
    const next = browser.querySelector<HTMLButtonElement>("[data-page-next]");
    const status = browser.querySelector<HTMLElement>("[data-page-status]");
    const pageSize = Number(browser.dataset.pageSize ?? 10);
    let page = 1;

    const update = () => {
      const visible = cards.filter((card) => {
        const topicMatch =
          !topic?.value ||
          card.dataset.topics?.split(" ").includes(topic.value);
        const conceptMatch =
          !concept?.value ||
          card.dataset.concepts?.split(" ").includes(concept.value);
        return topicMatch && conceptMatch;
      });
      const pages = Math.max(1, Math.ceil(visible.length / pageSize));
      page = Math.min(page, pages);
      cards.forEach((card) => (card.hidden = true));
      visible
        .slice((page - 1) * pageSize, page * pageSize)
        .forEach((card) => (card.hidden = false));
      if (status)
        status.textContent = visible.length
          ? `第 ${page} / ${pages} 页 · ${visible.length} 篇`
          : "没有匹配文章";
      if (previous) previous.disabled = page <= 1;
      if (next) next.disabled = page >= pages;
    };
    const onFilter = () => {
      page = 1;
      update();
    };
    const onReset = () => {
      if (topic) topic.value = "";
      if (concept) concept.value = "";
      page = 1;
      update();
    };
    const onPrevious = () => {
      page = Math.max(1, page - 1);
      update();
    };
    const onNext = () => {
      page += 1;
      update();
    };
    topic?.addEventListener("change", onFilter);
    concept?.addEventListener("change", onFilter);
    reset?.addEventListener("click", onReset);
    previous?.addEventListener("click", onPrevious);
    next?.addEventListener("click", onNext);
    window.addCleanup(() => {
      topic?.removeEventListener("change", onFilter);
      concept?.removeEventListener("change", onFilter);
      reset?.removeEventListener("click", onReset);
      previous?.removeEventListener("click", onPrevious);
      next?.removeEventListener("click", onNext);
    });
    update();
  }
}

document.addEventListener("nav", setupPrimaryNavigation);
