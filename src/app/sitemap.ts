/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { MetadataRoute } from "next";
import { ARCH_LESSONS } from "@/data/arch";
import { ML_LESSONS } from "@/data/ml";
import { PATTERNS } from "@/data/patterns";
import { absoluteUrl, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(SITE.updated);
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    {
      url: absoluteUrl("/patterns"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/architecture"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/architecture/cheatsheet"),
      changeFrequency: "monthly",
      priority: 0.7,
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
      images: [absoluteUrl(`/patterns/${p.slug}/og.png`)],
    })),
    ...ARCH_LESSONS.map((l) => ({
      url: absoluteUrl(`/architecture/${l.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.85,
      images: [absoluteUrl(`/architecture/${l.slug}/og.png`)],
    })),
    ...ML_LESSONS.map((l) => ({
      url: absoluteUrl(`/ml/${l.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [absoluteUrl(`/ml/${l.slug}/og.png`)],
    })),
  ];
  return entries.map((e) => ({ ...e, lastModified }));
}
