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
    ".inst4-hero, .inst4-core-statement, .inst4-work, .inst4-research",
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

  // Archive filters are initialized independently by KnowledgeBrowser.
}

document.addEventListener("nav", setupPrimaryNavigation);
