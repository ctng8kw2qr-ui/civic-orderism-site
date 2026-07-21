const MIN_CORE_JUDGMENTS = 2;
export const MAX_CORE_JUDGMENTS = 5;

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") return [value];
  return [];
}

export function normalizeCoreJudgments(
  ...candidateValues: unknown[]
): string[] | undefined {
  const source = candidateValues.find(
    (candidate) => asStringArray(candidate).length > 0,
  );
  if (source === undefined) return undefined;

  const judgments = [
    ...new Set(
      asStringArray(source)
        .map((judgment) => judgment.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_CORE_JUDGMENTS);

  return judgments.length >= MIN_CORE_JUDGMENTS ? judgments : undefined;
}
