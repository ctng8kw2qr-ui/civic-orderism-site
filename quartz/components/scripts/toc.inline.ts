function updateActiveTocEntry() {
  const headers = Array.from(
    document.querySelectorAll<HTMLElement>("h2[id], h3[id]"),
  )
  if (headers.length === 0) return

  let active = headers[0]
  const offset = window.innerHeight * 0.25
  for (const header of headers) {
    if (header.getBoundingClientRect().top <= offset) {
      active = header
    } else {
      break
    }
  }

  document.querySelectorAll(".toc a[data-for]").forEach((link) => {
    const isActive = link.getAttribute("data-for") === active.id
    link.classList.toggle("active", isActive)
    link.classList.toggle("in-view", isActive)
  })
}

function handleTocClick(event: Event) {
  const link = event.currentTarget as HTMLAnchorElement
  const targetId = link.getAttribute("data-for")
  const target = targetId ? document.getElementById(targetId) : null
  if (!target) return

  event.preventDefault()
  target.scrollIntoView({ behavior: "smooth", block: "start" })
  history.pushState(null, "", `#${targetId}`)
  updateActiveTocEntry()
}

function setupTocLinks() {
  document
    .querySelectorAll<HTMLAnchorElement>(".toc a[data-for]")
    .forEach((link) => {
      link.addEventListener("click", handleTocClick)
      window.addCleanup(() => link.removeEventListener("click", handleTocClick))
    })
}

function setupTocScrollSpy() {
  updateActiveTocEntry()
  document.addEventListener("scroll", updateActiveTocEntry, { passive: true })
  window.addEventListener("resize", updateActiveTocEntry)
  window.addCleanup(() =>
    document.removeEventListener("scroll", updateActiveTocEntry),
  )
  window.addCleanup(() =>
    window.removeEventListener("resize", updateActiveTocEntry),
  )
}

function toggleToc(this: HTMLElement) {
  this.classList.toggle("collapsed")
  this.setAttribute(
    "aria-expanded",
    this.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
  const content = this.nextElementSibling as HTMLElement | undefined
  if (!content) return
  content.classList.toggle("collapsed")
}

function setupToc() {
  for (const toc of document.getElementsByClassName("toc")) {
    const button = toc.querySelector(".toc-header")
    const content = toc.querySelector(".toc-content")
    if (!button || !content) return
    if (toc.classList.contains("toc-article")) {
      const shouldCollapse = window.matchMedia("(max-width: 800px)").matches
      button.classList.toggle("collapsed", shouldCollapse)
      button.setAttribute("aria-expanded", shouldCollapse ? "false" : "true")
      content.classList.toggle("collapsed", shouldCollapse)
    }
    button.addEventListener("click", toggleToc)
    window.addCleanup(() => button.removeEventListener("click", toggleToc))
  }
}

document.addEventListener("nav", () => {
  setupToc()
  setupTocLinks()
  setupTocScrollSpy()
})
