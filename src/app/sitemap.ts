/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { MetadataRoute } from "next";
import { PATTERNS } from "@/data/patterns";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
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
  ];
}
