import assert from "node:assert/strict";
import test from "node:test";
import {
  getConceptPublicationStatus,
  isIndexableConcept,
  isVisibleConcept,
  resolveReadingSequence,
  sortByPublishedDate,
} from "./knowledgeNavigation";

test("concept status separates formal, research, and hidden concepts", () => {
  assert.equal(
    getConceptPublicationStatus({ publicationStatus: "published" }),
    "published",
  );
  assert.equal(
    getConceptPublicationStatus({ publicationStatus: "reviewing" }),
    "reviewing",
  );
  assert.equal(isVisibleConcept({ publicationStatus: "reviewing" }), true);
  assert.equal(isIndexableConcept({ publicationStatus: "reviewing" }), false);
  assert.equal(isVisibleConcept({ publicationStatus: "held" }), false);
  assert.equal(isVisibleConcept({ publicationStatus: "merged" }), false);
});

test("published dates sort newest first with a stable slug tie-break", () => {
  const result = sortByPublishedDate(
    [
      { slug: "b", date: "2026-07-19" },
      { slug: "c", date: "2026-07-20" },
      { slug: "a", date: "2026-07-19" },
    ],
    (item) => item.date,
    (item) => item.slug,
  );
  assert.deepEqual(
    result.map((item) => item.slug),
    ["c", "a", "b"],
  );
});

test("reading sequences ignore missing items without breaking navigation", () => {
  const result = resolveReadingSequence(
    [
      {
        id: "intro",
        name: "入门",
        items: [
          { href: "/start", title: "开始" },
          { slug: "missing" },
          { slug: "current" },
          { slug: "next" },
        ],
      },
    ],
    [{ slug: "current" }, { slug: "next" }],
    "current",
    (file) => file.slug,
  );

  assert.ok(result);
  assert.equal(result.index, 1);
  assert.deepEqual(
    result.items.map((item) => item.slug ?? item.href),
    ["/start", "current", "next"],
  );
});
