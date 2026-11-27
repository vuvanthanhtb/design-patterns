import { EXAMPLES } from "./code";
import { PATTERNS } from "./nav";
import { SEQUENCES } from "./sequences";

export { NAV_INDEX, number, PATTERNS } from "./nav";

export function getPattern(slug: string) {
  const index = PATTERNS.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return {
    pattern: PATTERNS[index],
    sequence: SEQUENCES[slug],
    example: EXAMPLES[slug],
    index,
    prev: PATTERNS[index - 1] ?? null,
    next: PATTERNS[index + 1] ?? null,
  };
}
