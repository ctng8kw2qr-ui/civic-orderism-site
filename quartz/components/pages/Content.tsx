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
  const titleEnd = titleIndex >= 0 ? titleIndex + 1 : 0;
  const titleTree: Root = {
    ...tree,
    children: tree.children.slice(0, titleEnd),
  };
  const articleBodyTree: Root = {
    ...tree,
    children: tree.children.slice(titleEnd),
  };
  const title = htmlToJsx(fileData.filePath!, titleTree) as ComponentChildren;
  const articleBody = htmlToJsx(
    fileData.filePath!,
    articleBodyTree,
  ) as ComponentChildren;

  return (
    <article class={classString}>
      {title}
      <div class="article-content">{articleBody}</div>
    </article>
  );
};

export default (() => Content) satisfies QuartzComponentConstructor;
