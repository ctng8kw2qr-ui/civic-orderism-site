function setupSectionArchive() {
  for (const details of document.querySelectorAll<HTMLDetailsElement>(
    "[data-section-archive]",
  )) {
    if (details.dataset.bound === "true") continue;

    const summary = details.querySelector<HTMLElement>("summary");
    const collapse = details.querySelector<HTMLButtonElement>(
      "[data-section-archive-collapse]",
    );
    if (!summary || !collapse) continue;

    details.dataset.bound = "true";
    const onCollapse = () => {
      summary.scrollIntoView({ block: "start" });
      details.open = false;
      summary.focus({ preventScroll: true });
    };

    collapse.addEventListener("click", onCollapse);
    window.addCleanup(() => collapse.removeEventListener("click", onCollapse));
  }
}

document.addEventListener("nav", setupSectionArchive);
