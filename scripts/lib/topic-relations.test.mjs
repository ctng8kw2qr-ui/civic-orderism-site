import assert from "node:assert/strict";
import test from "node:test";

import {
  getPrimaryTopicArticles,
  resolveTopicRelations,
} from "./topic-relations.mjs";

const topics = new Set(["topic-a", "topic-b"]);

test("primary topic archive ignores related and inferred topic relations", () => {
  const article = {
    slug: "example/article",
    title: "Example",
    date: "2026-07-20",
    status: "published",
    needsReview: false,
    ...resolveTopicRelations({
      primaryTopic: "topic-a",
      relatedTopics: ["topic-b"],
      validTopicSlugs: topics,
    }),
    concepts: ["concept-associated-with-topic-b"],
  };

  assert.deepEqual(getPrimaryTopicArticles([article], "topic-a"), [article]);
  assert.deepEqual(getPrimaryTopicArticles([article], "topic-b"), []);
});

test("primary topic archive excludes drafts, archives and review items", () => {
  const base = {
    title: "Example",
    date: "2026-07-20",
    status: "published",
    primaryTopic: "topic-a",
  };
  const articles = [
    { ...base, slug: "published" },
    { ...base, slug: "draft", draft: true },
    { ...base, slug: "archived", archived: true },
    { ...base, slug: "review", needsReview: true },
    { ...base, slug: "unpublished", published: false },
  ];

  assert.deepEqual(
    getPrimaryTopicArticles(articles, "topic-a").map((article) => article.slug),
    ["published"],
  );
});

test("topic relations contain one primary topic and deduplicated related topics", () => {
  assert.deepEqual(
    resolveTopicRelations({
      primaryTopic: "topic-a",
      relatedTopics: ["topic-a", "topic-b", "topic-b", "unknown"],
      validTopicSlugs: topics,
    }),
    {
      primaryTopic: "topic-a",
      relatedTopics: ["topic-b"],
      topics: ["topic-a", "topic-b"],
    },
  );
});
