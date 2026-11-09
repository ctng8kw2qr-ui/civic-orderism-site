/** Presentation contracts, kept separate from political/organizational wording. */
export const visibleText = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function balancedElement(html, start, tag) {
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
  tags.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tags.exec(html))) {
    if (match[0].startsWith("</")) depth--;
    else if (!match[0].endsWith("/>")) depth++;
    if (depth === 0) return html.slice(start, tags.lastIndex);
  }
  return "";
}
export function elementById(html, id) {
  const match = new RegExp(
    `<([a-z][\\w-]*)\\b[^>]*\\bid="${escape(id)}"[^>]*>`,
    "i",
  ).exec(html);
  return match ? balancedElement(html, match.index, match[1]) : "";
}
export function elementsByClass(html, tag, className) {
  const openings = [
    ...html.matchAll(
      new RegExp(`<${tag}\\b[^>]*\\bclass="([^"]*)"[^>]*>`, "gi"),
    ),
  ];
  return openings
    .filter((m) => m[1].split(/\s+/).includes(className))
    .map((m) => balancedElement(html, m.index, tag));
}
export function linkedSlugs(html, base = "https://civicorderism.com/") {
  return [...html.matchAll(/\bhref="([^"]+)"/g)].flatMap((m) => {
    try {
      const url = new URL(m[1], base);
      return url.origin === "https://civicorderism.com"
        ? [
            url.pathname
              .replace(/^\//, "")
              .replace(/\/index\.html$|\.html$|\/$/g, ""),
          ]
        : [];
    } catch {
      return [];
    }
  });
}
export function contactBoundaryContract(contactHtml, preparationHtml) {
  const text = visibleText(contactHtml);
  const paragraphs = [...contactHtml.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/g)].map(
    (m) => visibleText(m[0]),
  );
  const disclaimer =
    paragraphs.find((p) => p.includes("建立联系不等于加入组织")) ?? "";
  const noIdentity = [
    "提供意见",
    "不产生组织身份",
    "成员资格",
    "授权关系",
    "任何正式职务",
  ].every((t) => disclaimer.includes(t));
  const procedure = paragraphs.some((p) =>
    [
      "任何正式治理身份都必须",
      "法人制度准备和法律程序完成后",
      "依照章程与正式程序产生",
    ].every((t) => p.includes(t)),
  );
  const boardEntry =
    linkedSlugs(contactHtml).includes("preparation/board") &&
    text.includes("了解首届董事会筹备");
  return {
    opinionsDoNotGrantIdentity: noIdentity,
    longTermContact: ["初步沟通", "具体协作", "明确边界", "长期关系"].every(
      (t) => text.includes(t),
    ),
    contactDoesNotGrantRole: noIdentity,
    boardEntry,
    noPublicAppointment:
      procedure &&
      boardEntry &&
      visibleText(preparationHtml).includes("不会通过公开报名直接产生董事资格"),
    contactIsNotAppointment: noIdentity && procedure,
    authorization: paragraphs.some((p) =>
      [
        "未经正式授权",
        "不得代表公民秩序主义",
        "对外沟通、表态、联络或建立政治关系",
      ].every((t) => p.includes(t)),
    ),
  };
}
export function institutionArchiveContract(html, sections, extraItems) {
  const cards = elementsByClass(
    html,
    "article",
    "knowledge-card--institution",
  ).map((card) => {
    const heading = card.match(/<h3\b[^>]*>[\s\S]*?<\/h3>/)?.[0] ?? "";
    return {
      slug: linkedSlugs(
        heading,
        "https://civicorderism.com/institution-design/",
      )[0],
      module: card.match(/data-institution-section="([^"]+)"/)?.[1],
      nested: (card.match(/<article\b/g) ?? []).length !== 1,
      label: visibleText(
        card.match(/<p class="knowledge-card__section">[\s\S]*?<\/p>/)?.[0] ??
          "",
      ),
    };
  });
  const expected = [...sections.flatMap((s) => s.articles), ...extraItems];
  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const one = (slug) => cards.filter((c) => c.slug === slug).length === 1;
  return {
    cards,
    expected,
    complete:
      cards.length === expected.length &&
      expected.every(one) &&
      cards.every((c) => expected.includes(c.slug)),
    flat: cards.every((c) => !c.nested),
    knownModules: cards.every(
      (c) =>
        sectionById.has(c.module) &&
        c.label.includes(sectionById.get(c.module).name),
    ),
    correctAssignments: sections.every((s) =>
      s.articles.every((slug) =>
        cards.some((c) => c.slug === slug && c.module === s.id),
      ),
    ),
    one,
  };
}
