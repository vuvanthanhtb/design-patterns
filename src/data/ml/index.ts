/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { ML_CODE } from "./code";
import { ML_GROUPS, ML_LESSONS } from "./lessons";

export { ML_GROUPS, ML_LESSONS };

export const ML_GROUP_NUM = {
  foundation: "01",
  supervised: "02",
  unsupervised: "03",
} as const;

export function getMlLesson(slug: string) {
  const index = ML_LESSONS.findIndex((l) => l.slug === slug);
  if (index === -1) return null;
  return {
    lesson: ML_LESSONS[index],
    example: ML_CODE[slug],
    index,
    prev: ML_LESSONS[index - 1] ?? null,
    next: ML_LESSONS[index + 1] ?? null,
  };
}
