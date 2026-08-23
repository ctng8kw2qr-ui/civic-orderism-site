function setupPrimaryNavigation() {
  for (const nav of document.querySelectorAll<HTMLElement>(".inst4-nav")) {
    const toggle = nav.querySelector<HTMLButtonElement>(".inst4-nav__toggle");
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
      ".inst4-nav__links a",
    );
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    toggle.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onKeyDown);
    links.forEach((link) => link.addEventListener("click", onLinkClick));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    window.addCleanup(() => {
      toggle.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onKeyDown);
      links.forEach((link) => link.removeEventListener("click", onLinkClick));
      window.removeEventListener("scroll", onScroll);
    });
  }

  // Header search trigger -> opens the shared Quartz search overlay.
  for (const trigger of document.querySelectorAll<HTMLElement>(
    "[data-inst4-search]",
  )) {
    if (trigger.dataset.bound === "true") continue;
    trigger.dataset.bound = "true";
    const openSearch = () => {
      const container = document.querySelector<HTMLElement>(
        ".search .search-container",
      );
      const bar = document.querySelector<HTMLInputElement>(
        ".search .search-bar",
      );
      container?.classList.add("active");
      bar?.focus();
      for (const nav of document.querySelectorAll<HTMLElement>(".inst4-nav")) {
        nav.dataset.open = "false";
        nav
          .querySelector<HTMLButtonElement>(".inst4-nav__toggle")
          ?.setAttribute("aria-expanded", "false");
      }
    };
    trigger.addEventListener("click", openSearch);
    window.addCleanup(() => trigger.removeEventListener("click", openSearch));
  }

  // Restrained section reveal on the institutional homepage.
  const revealTargets = document.querySelectorAll<HTMLElement>(
    ".inst4-hero, .inst4-work, .inst4-research",
  );
  if (
    revealTargets.length &&
    !document.querySelector("[data-inst-reveal-bound]")
  ) {
    document.documentElement.setAttribute("data-inst-reveal-bound", "true");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
      );
      revealTargets.forEach((target) => observer.observe(target));
      window.addCleanup(() => observer.disconnect());
    } else {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
    }
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
    const sectionButtons = [
      ...browser.querySelectorAll<HTMLButtonElement>("[data-filter-section]"),
    ];
    const sectionLinks = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        "[data-institution-filter-link]",
      ),
    ];
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
    let activeSection = "";
    let page = 1;

    const update = () => {
      const visible = cards.filter((card) => {
        const sectionMatch =
          !activeSection || card.dataset.institutionSection === activeSection;
        const topicMatch =
          !topic?.value ||
          card.dataset.topics?.split(" ").includes(topic.value);
        const conceptMatch =
          !concept?.value ||
          card.dataset.concepts?.split(" ").includes(concept.value);
        return sectionMatch && topicMatch && conceptMatch;
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
      sectionButtons.forEach((button) => {
        const isActive = button.dataset.filterSection === activeSection;
        button.setAttribute("aria-pressed", String(isActive));
      });
    };
    const onFilter = () => {
      page = 1;
      update();
    };
    const onReset = () => {
      if (topic) topic.value = "";
      if (concept) concept.value = "";
      activeSection = "";
      page = 1;
      update();
    };
    const onSectionFilter = (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      activeSection = button.dataset.filterSection ?? "";
      page = 1;
      update();
    };
    const onSectionLink = (event: Event) => {
      const link = event.currentTarget as HTMLAnchorElement;
      activeSection = link.dataset.institutionFilterLink ?? "";
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
    sectionButtons.forEach((button) =>
      button.addEventListener("click", onSectionFilter),
    );
    sectionLinks.forEach((link) =>
      link.addEventListener("click", onSectionLink),
    );
    reset?.addEventListener("click", onReset);
    previous?.addEventListener("click", onPrevious);
    next?.addEventListener("click", onNext);
    window.addCleanup(() => {
      topic?.removeEventListener("change", onFilter);
      concept?.removeEventListener("change", onFilter);
      sectionButtons.forEach((button) =>
        button.removeEventListener("click", onSectionFilter),
      );
      sectionLinks.forEach((link) =>
        link.removeEventListener("click", onSectionLink),
      );
      reset?.removeEventListener("click", onReset);
      previous?.removeEventListener("click", onPrevious);
      next?.removeEventListener("click", onNext);
    });
    update();
  }
}

document.addEventListener("nav", setupPrimaryNavigation);
