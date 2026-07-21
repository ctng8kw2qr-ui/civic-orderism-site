export type ConceptPublicationStatus =
  | "published"
  | "reviewing"
  | "merged"
  | "held";

type ConceptStatusSource = {
  publicationStatus?: string;
  publicationClass?: string;
  status?: string;
};

export function getConceptPublicationStatus(
  concept: ConceptStatusSource,
): ConceptPublicationStatus {
  if (
    concept.publicationStatus === "published" ||
    concept.publicationStatus === "reviewing" ||
    concept.publicationStatus === "merged" ||
    concept.publicationStatus === "held"
  ) {
    return concept.publicationStatus;
  }
  if (concept.status === "published") return "published";
  if (concept.publicationClass === "B") return "reviewing";
  return "held";
}

export function isVisibleConcept(concept: ConceptStatusSource) {
  const status = getConceptPublicationStatus(concept);
  return status === "published" || status === "reviewing";
}

export function isIndexableConcept(concept: ConceptStatusSource) {
  return getConceptPublicationStatus(concept) === "published";
}

export function sortByPublishedDate<T>(
  items: readonly T[],
  getDate: (item: T) => string,
  getStableKey: (item: T) => string,
) {
  return [...items].sort(
    (a, b) =>
      getDate(b).localeCompare(getDate(a)) ||
      getStableKey(a).localeCompare(getStableKey(b), "zh-CN"),
  );
}

export type ReadingSequenceItem = {
  slug?: string;
  href?: string;
  title?: string;
};

export type ReadingSequenceConfig = {
  id: string;
  name: string;
  items: ReadingSequenceItem[];
};

export type ResolvedReadingSequenceItem<T> = ReadingSequenceItem & {
  file?: T;
};

export function resolveReadingSequence<T>(
  sequences: readonly ReadingSequenceConfig[],
  files: readonly T[],
  currentSlug: string,
  getSlug: (file: T) => string | undefined,
) {
  const fileBySlug = new Map(
    files
      .map((file) => [getSlug(file), file] as const)
      .filter((entry): entry is readonly [string, T] => Boolean(entry[0])),
  );

  for (const sequence of sequences) {
    const items: ResolvedReadingSequenceItem<T>[] = sequence.items.flatMap(
      (item) => {
        if (!item.slug) return item.href ? [item] : [];
        const file = fileBySlug.get(item.slug);
        return file ? [{ ...item, file }] : [];
      },
    );
    const index = items.findIndex((item) => item.slug === currentSlug);
    if (index >= 0) return { sequence, items, index };
  }

  return undefined;
}
