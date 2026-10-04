const svgCopy =
  '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="9" y="9" width="12" height="12" rx="2"></rect>' +
  '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
  "</svg>";
// Success state. Still green so "copied" stays unmistakable, but drawn as an
// OUTLINE on the shared 24 grid like every other icon — the previous version
// was a fill-based glyph, which is what allowed a stray `fill` rule in
// clipboard.scss to repaint it as a solid block.
const svgCheck =
  '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(63, 185, 80)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M20 6 9 17l-5-5"></path>' +
  "</svg>";

// Kept so the control does not quietly lose its accessible name while showing
// the success mark; assistive tech should not still hear "Copy source".
const labelCopy = "Copy source";
const labelCopied = "Copied";

document.addEventListener("nav", () => {
  const els = document.getElementsByTagName("pre");
  for (let i = 0; i < els.length; i++) {
    const codeBlock = els[i].getElementsByTagName("code")[0];
    if (codeBlock) {
      const source = (
        codeBlock.dataset.clipboard
          ? JSON.parse(codeBlock.dataset.clipboard)
          : codeBlock.innerText
      ).replace(/\n\n/g, "\n");
      const button = document.createElement("button");
      button.className = "clipboard-button";
      button.type = "button";
      button.innerHTML = svgCopy;
      button.ariaLabel = labelCopy;
      function onClick() {
        navigator.clipboard.writeText(source).then(
          () => {
            // No blur(): a keyboard user who pressed Enter must keep focus on
            // the control they just activated. Removing it was half of why
            // focus was invisible here.
            button.innerHTML = svgCheck;
            button.ariaLabel = labelCopied;
            setTimeout(() => {
              button.innerHTML = svgCopy;
              button.ariaLabel = labelCopy;
            }, 2000);
          },
          (error) => console.error(error),
        );
      }
      button.addEventListener("click", onClick);
      window.addCleanup(() => button.removeEventListener("click", onClick));
      els[i].prepend(button);
    }
  }
});
