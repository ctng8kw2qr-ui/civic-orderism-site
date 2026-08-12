import { Element, Root } from "hast";
import { toString } from "hast-util-to-string";
import { isArticleSlug } from "../util/articlePage";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";

function isElement(node: Root["children"][number]): node is Element {
  return node.type === "element";
}

function hasClass(node: Element, className: string) {
  const value = node.properties?.className;
  const classes = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\s+/)
      : [];
  return classes.includes(className);
}

function articleSubtitle(tree: QuartzComponentProps["tree"]) {
  if (tree.type !== "root") return undefined;
  const root = tree as Root;
  const titleIndex = root.children.findIndex(
    (node) => isElement(node) && node.tagName === "h1",
  );
  const subtitle = root.children
    .slice(titleIndex >= 0 ? titleIndex + 1 : 0)
    .find(
      (node) =>
        isElement(node) && node.tagName === "p" && hasClass(node, "subtitle"),
    );
  return subtitle && isElement(subtitle)
    ? toString(subtitle).trim()
    : undefined;
}

const ArticleHeader: QuartzComponent = ({
  fileData,
  tree,
}: QuartzComponentProps) => {
  if (!isArticleSlug(fileData.slug ?? "")) return null;
  const title = fileData.frontmatter?.title;
  if (!title) return null;
  const explicitSubtitle = fileData.frontmatter?.subtitle;
  const subtitle =
    typeof explicitSubtitle === "string" && explicitSubtitle.trim() !== ""
      ? explicitSubtitle.trim()
      : articleSubtitle(tree);

  return (
    <header class="article-header">
      <h1 class="article-header__title">{title}</h1>
      {subtitle ? <p class="article-header__subtitle">{subtitle}</p> : null}
    </header>
  );
};

export default (() => ArticleHeader) satisfies QuartzComponentConstructor;
