import { ComponentChildren } from "preact";
import type { Element, Root, Text } from "hast";
import { clone } from "../../util/clone";
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

function textContent(node: Root["children"][number]): string {
  if (node.type === "text") return node.value;
  if (node.type !== "element") return "";
  return node.children.map((child) => textContent(child)).join("");
}

function replaceLeadingCoreJudgment(node: Root["children"][number]): boolean {
  if (node.type === "text") {
    const replaced = node.value.replace(/核心判断/, "重点句");
    if (replaced === node.value) return false;
    node.value = replaced;
    return true;
  }
  if (node.type !== "element") return false;
  for (const child of node.children) {
    if (replaceLeadingCoreJudgment(child)) return true;
  }
  return false;
}

function normalizeLocalJudgmentLabels(tree: Root) {
  for (const child of tree.children) {
    if (child.type !== "element") continue;
    if (
      /^h[2-4]$/.test(child.tagName) &&
      textContent(child).trim() === "核心判断"
    ) {
      const textNode = child.children.find(
        (node): node is Text => node.type === "text",
      );
      if (textNode) textNode.value = "重点句";
      continue;
    }
    if (child.tagName !== "blockquote") continue;
    const firstParagraph = child.children.find(
      (node): node is Element =>
        node.type === "element" && node.tagName === "p",
    );
    if (
      firstParagraph &&
      /^核心判断[：:]/.test(textContent(firstParagraph).trim())
    ) {
      replaceLeadingCoreJudgment(firstParagraph);
    }
  }
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
  const articleBodyTree = clone({
    ...tree,
    children: tree.children.slice(bodyStart),
  }) as Root;
  normalizeLocalJudgmentLabels(articleBodyTree);
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
