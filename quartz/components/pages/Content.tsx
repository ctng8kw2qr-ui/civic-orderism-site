import { ComponentChildren } from "preact";
import type { Root } from "hast";
import { htmlToJsx } from "../../util/jsx";
import { isArticleSlug } from "../../util/articlePage";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../types";

function isRootNode(tree: QuartzComponentProps["tree"]): tree is Root {
  return tree.type === "root";
}

function hasClass(child: Root["children"][number], className: string): boolean {
  if (child.type !== "element") return false;
  const value = child.properties?.className;
  const classes = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\s+/)
      : [];
  return classes.includes(className);
}

function isBlankText(child: Root["children"][number] | undefined): boolean {
  return child?.type === "text" && child.value.trim() === "";
}

const Content: QuartzComponent = ({ fileData, tree }: QuartzComponentProps) => {
  const classes: string[] = fileData.frontmatter?.cssclasses ?? [];
  const classString = ["popover-hint", ...classes].join(" ");

  if (!isArticleSlug(fileData.slug) || !isRootNode(tree)) {
    const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren;
    return <article class={classString}>{content}</article>;
  }

  const titleIndex = tree.children.findIndex(
    (child) => child.type === "element" && child.tagName === "h1",
  );
  let bodyStart = titleIndex >= 0 ? titleIndex + 1 : 0;
  while (isBlankText(tree.children[bodyStart])) {
    bodyStart += 1;
  }
  if (hasClass(tree.children[bodyStart], "subtitle")) bodyStart += 1;
  while (isBlankText(tree.children[bodyStart])) {
    bodyStart += 1;
  }
  const articleBodyTree: Root = {
    ...tree,
    children: tree.children.slice(bodyStart),
  };
  const articleBody = htmlToJsx(
    fileData.filePath!,
    articleBodyTree,
  ) as ComponentChildren;

  return (
    <article class={`${classString} article-page`}>
      <div class="article-content">{articleBody}</div>
    </article>
  );
};

export default (() => Content) satisfies QuartzComponentConstructor;
