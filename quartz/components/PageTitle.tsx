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
  line-height: 1.15;
}

.page-title .site-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  max-width: 100%;
}

.page-title .site-brand img {
  width: 4.4rem;
  height: 4.4rem;
  flex: 0 0 4.4rem;
  object-fit: contain;
  display: block;
  margin: 0;
  border-radius: 0;
}

.page-title .site-brand span {
  min-width: 0;
}

@media (max-width: 800px) {
  .page-title {
    font-size: 1.55rem;
  }

  .page-title .site-brand {
    gap: 0.6rem;
  }

  .page-title .site-brand img {
    width: 3.55rem;
    height: 3.55rem;
    flex-basis: 3.55rem;
  }
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
