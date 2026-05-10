import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={baseDir} class="site-brand">
        <img src={`${baseDir}/static/logo.png`} alt="公民秩序主义 Logo" />
        <span>{title}</span>
      </a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  font-size: 1.75rem;
  margin: 0;
  font-family: var(--titleFont);
}

.page-title .site-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}

.page-title .site-brand img {
  width: 2.35rem;
  height: 2.35rem;
  object-fit: contain;
  display: block;
  margin: 0;
  border-radius: 0;
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
