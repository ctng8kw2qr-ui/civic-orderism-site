import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";
import style from "./styles/articleAttribution.scss";

const ArticleAttribution: QuartzComponent = ({
  displayClass,
}: QuartzComponentProps) => {
  return (
    <section
      class={`article-attribution ${displayClass ?? ""}`}
      aria-label="文章来源"
    >
      <p>
        本文发布于 <strong>civicorderism</strong>
      </p>
      <p>
        官方网站：
        <a href="https://civicorderism.com/">https://civicorderism.com</a>
      </p>
      <p>
        X 平台：<a href="https://x.com/CivicOrderism">@CivicOrderism</a>
      </p>
      <p>转载请保留出处。</p>
    </section>
  );
};

ArticleAttribution.css = style;

export default (() => ArticleAttribution) satisfies QuartzComponentConstructor;
