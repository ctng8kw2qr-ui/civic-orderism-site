import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    );
  }
  if (typeof value === "string" && value.trim() !== "") return [value];
  return [];
}

const ArticleInstitutionalCoreJudgment: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>;

  const judgments = asStringArray(fm.coreJudgments);
  if (judgments.length === 0) return null;

  return (
    <section class="article-inst-judgment" aria-label="核心判断">
      <p class="article-inst-judgment__label">CORE JUDGMENT / 核心判断</p>
      <div class="article-inst-judgment__rule" aria-hidden="true" />
      <div class="article-inst-judgment__statements">
        {judgments.map((judgment, index) => (
          <p class="article-inst-judgment__text">
            {judgments.length > 1 ? (
              <span class="article-inst-judgment__number">
                {String(index + 1).padStart(2, "0")}
              </span>
            ) : null}
            {judgment}
          </p>
        ))}
      </div>
    </section>
  );
};

export default (() => ArticleInstitutionalCoreJudgment) satisfies QuartzComponentConstructor;
