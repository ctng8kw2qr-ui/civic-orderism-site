const svgCopy =
  '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="9" y="9" width="12" height="12" rx="2"></rect>' +
  '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
  "</svg>";
const svgCheck =
  '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">' +
  '<path fill="rgb(63, 185, 80)" d="M9.55 17.6 4.4 12.45a1.1 1.1 0 0 1 1.56-1.56l3.59 3.59 8.49-8.49a1.1 1.1 0 0 1 1.56 1.56z"></path>' +
  "</svg>";

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
      button.ariaLabel = "Copy source";
      function onClick() {
        navigator.clipboard.writeText(source).then(
          () => {
            button.blur();
            button.innerHTML = svgCheck;
            setTimeout(() => {
              button.innerHTML = svgCopy;
              button.style.borderColor = "";
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
