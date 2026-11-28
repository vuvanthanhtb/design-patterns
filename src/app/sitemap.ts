/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { MetadataRoute } from "next";
import { ML_LESSONS } from "@/data/ml";
import { PATTERNS } from "@/data/patterns";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    {
      url: absoluteUrl("/patterns"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: absoluteUrl("/ml"), changeFrequency: "monthly", priority: 0.9 },
    {
      url: absoluteUrl("/ml/cheatsheet"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/cheatsheet"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...PATTERNS.map((p) => ({
      url: absoluteUrl(`/patterns/${p.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.9,
      images: [absoluteUrl(`/patterns/${p.slug}/opengraph-image`)],
    })),
    ...ML_LESSONS.map((l) => ({
      url: absoluteUrl(`/ml/${l.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [absoluteUrl(`/ml/${l.slug}/opengraph-image`)],
    })),
  ];
}
