import migration from "../../content-migration-map.json";
import institutionSections from "../../data/institution-sections.config.json";
import sections from "../../data/sections.config.json";
import topics from "../../data/topics.config.json";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";

const primaryLinks = [
  { label: "从这里开始", href: "/start" },
  ...sections.map((section) => ({
    label: section.name,
    href: `/${section.slug}`,
  })),
  { label: "专题", href: "/topics" },
  { label: "核心概念", href: "/concepts" },
  { label: "阅读地图", href: "/articles" },
  { label: "关于", href: "/about" },
];

const sectionByName = new Map(
  sections.map((section) => [section.name, section]),
);
const topicBySlug = new Map(topics.map((topic) => [topic.slug, topic]));
const articleSectionBySlug = new Map(
  migration.map((article) => [article.slug, article.section]),
);

function activeSection(slug: string) {
  const directSection = sections.find(
    (section) => slug === section.slug || slug.startsWith(`${section.slug}/`),
  );
  if (directSection) return directSection;
  return sectionByName.get(articleSectionBySlug.get(slug) ?? "");
}

const KnowledgeSidebar: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const slug = fileData.slug ?? "";
  const currentSection = activeSection(slug);
  const isActive = (href: string) => {
    const target = href.replace(/^\//, "");
    if (currentSection && href === `/${currentSection.slug}`) return true;
    return slug === target || slug.startsWith(`${target}/`);
  };

  return (
    <nav class="knowledge-sidebar" aria-label="站点地图">
      <p class="knowledge-sidebar__label">浏览</p>
      <ul>
        {primaryLinks.map((item) => {
          const section = sections.find(
            (candidate) => `/${candidate.slug}` === item.href,
          );
          const expanded = section?.slug === currentSection?.slug;
          const sectionTopics =
            expanded && section
              ? section.topics
                  .map((topicSlug) => topicBySlug.get(topicSlug))
                  .filter((topic) => topic?.status === "published")
                  .slice(0, 5)
              : [];

          return (
            <li
              class={
                expanded ? "knowledge-sidebar__section is-expanded" : undefined
              }
            >
              <a
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </a>
              {expanded && section ? (
                <div class="knowledge-sidebar__section-links">
                  {section.slug === "institution-design" ? (
                    <>
                      <a href="/institution-design#institution-first-reading-title">
                        第一次阅读
                      </a>
                      {institutionSections.map((institutionSection) => (
                        <a
                          href={`/institution-design#institution-module-${institutionSection.id}`}
                        >
                          {institutionSection.number} ·{" "}
                          {institutionSection.name}
                        </a>
                      ))}
                      <a href="/institution-design#all-articles">
                        查看全部文章
                      </a>
                    </>
                  ) : (
                    <>
                      <a href={`/${section.slug}#推荐文章`}>推荐阅读</a>
                      {sectionTopics.map((topic) => (
                        <a href={`/topics/${topic!.slug}`}>{topic!.name}</a>
                      ))}
                      <a href={`/${section.slug}#全部文章`}>查看全部文章</a>
                    </>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

KnowledgeSidebar.css = `
.knowledge-sidebar {
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.knowledge-sidebar__label {
  margin: 0 0 0.5rem;
  color: var(--gray);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.knowledge-sidebar ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.knowledge-sidebar li {
  margin: 0;
}

.knowledge-sidebar li > a {
  display: block;
  padding: 0.42rem 0.5rem;
  border-radius: 4px;
  color: var(--darkgray);
  font-size: 0.9rem;
  line-height: 1.45;
  text-decoration: none;
  background-image: none;
}

.knowledge-sidebar li > a:hover,
.knowledge-sidebar li > a:focus-visible {
  background: var(--highlight);
  color: var(--dark);
  outline: none;
}

.knowledge-sidebar li > a[aria-current="page"] {
  background: color-mix(in srgb, var(--lightgray) 65%, transparent);
  color: var(--dark);
  font-weight: 650;
}

.knowledge-sidebar__section-links {
  display: grid;
  gap: 0.15rem;
  margin: 0.2rem 0 0.45rem 0.75rem;
  padding: 0.25rem 0 0.25rem 0.65rem;
  border-left: 1px solid var(--lightgray);
}

.knowledge-sidebar__section-links a {
  padding: 0.28rem 0.35rem;
  color: var(--gray);
  font-size: 0.78rem;
  line-height: 1.45;
  text-decoration: none;
  background-image: none;
}

.knowledge-sidebar__section-links a:hover,
.knowledge-sidebar__section-links a:focus-visible {
  color: var(--dark);
  outline: none;
}

@media (max-width: 800px) {
  .knowledge-sidebar {
    display: none;
  }
}
`;

export default (() => KnowledgeSidebar) satisfies QuartzComponentConstructor;
