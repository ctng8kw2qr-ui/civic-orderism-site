// V6 — Institutional Editorial · Primary Navigation behaviour
//
// 只做四件事：移动端抽屉开合、Escape 关闭、点击外部关闭、搜索触发。
// 不做装饰性动效。桌面端完全不写 data-open（由 CSS 媒体查询控制），
// 以免出现「桌面误判为折叠」的状态。

function setupV6Navigation() {
  const mobileQuery = window.matchMedia("(max-width: 800px)");

  for (const nav of document.querySelectorAll<HTMLElement>(".v6-nav")) {
    const toggle = nav.querySelector<HTMLButtonElement>(".v6-nav__toggle");
    const links = nav.querySelector<HTMLElement>(".v6-nav__links");
    if (!toggle || !links || toggle.dataset.bound === "true") continue;
    toggle.dataset.bound = "true";

    const setOpen = (open: boolean) => {
      nav.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    };

    const close = () => setOpen(false);

    const onToggle = () => setOpen(nav.dataset.open !== "true");

    const onOutsidePointer = (event: PointerEvent) => {
      if (nav.dataset.open === "true" && !nav.contains(event.target as Node)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || nav.dataset.open !== "true") return;
      event.preventDefault();
      close();
      requestAnimationFrame(() => toggle.focus());
    };

    // 点击任一条目后立即收起，避免 SPA 跳转后菜单残留。
    const onLinkClick = () => close();

    // 视口回到桌面宽度时清掉展开状态，防止旋转屏幕后抽屉卡住。
    const onViewportChange = () => {
      if (!mobileQuery.matches) close();
    };

    toggle.addEventListener("click", onToggle);
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onKeyDown);
    links.addEventListener("click", onLinkClick);
    mobileQuery.addEventListener("change", onViewportChange);

    // 初始状态：移动端收起，桌面端不设置 data-open。
    if (mobileQuery.matches) setOpen(false);
    else delete nav.dataset.open;

    window.addCleanup(() => {
      toggle.removeEventListener("click", onToggle);
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onKeyDown);
      links.removeEventListener("click", onLinkClick);
      mobileQuery.removeEventListener("change", onViewportChange);
    });
  }

  // 搜索触发：复用 Quartz 共享搜索浮层。
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
      for (const nav of document.querySelectorAll<HTMLElement>(".v6-nav")) {
        nav.dataset.open = "false";
        nav
          .querySelector<HTMLButtonElement>(".v6-nav__toggle")
          ?.setAttribute("aria-expanded", "false");
      }
    };
    trigger.addEventListener("click", openSearch);
    window.addCleanup(() => trigger.removeEventListener("click", openSearch));
  }
}

document.addEventListener("nav", setupV6Navigation);
