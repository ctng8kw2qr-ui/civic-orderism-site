import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/articleAttribution.scss"

const ArticleAttribution: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <section class={`article-attribution ${displayClass ?? ""}`} aria-label="文章来源">
      <p>
        本文发布于 <strong>Citizen Orderism（公民秩序主义）</strong>
      </p>
      <p>
        官方网站：<a href="https://civicorderism.com/">https://civicorderism.com</a>
      </p>
      <p>转载引用请保留出处。</p>
    </section>
  )
}

ArticleAttribution.css = style

export default (() => ArticleAttribution) satisfies QuartzComponentConstructor
