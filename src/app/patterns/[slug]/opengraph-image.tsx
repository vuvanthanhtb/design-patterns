/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { CATEGORY_INFO } from "@/data/meta";
import { getPattern, PATTERNS } from "@/data/patterns";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Bài học mẫu thiết kế GoF";
export const size = OG_SIZE;
export const contentType = "image/png";

// Render sẵn ảnh cho cả 23 bài lúc build
export function generateStaticParams() {
  return PATTERNS.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = getPattern(slug);
  if (!found) {
    return renderOg({
      eyebrow: "Design Patterns",
      title: "Không tìm thấy",
      subtitle: "",
      chips: [],
    });
  }
  const { pattern: p, sequence, index } = found;
  const cat = CATEGORY_INFO[p.category];
  return renderOg({
    eyebrow: `Bài ${String(index + 1).padStart(2, "0")} / 23 · ${p.viName}`,
    title: p.name,
    subtitle: p.intent.length > 110 ? `${p.intent.slice(0, 108)}…` : p.intent,
    chips: [
      {
        label: cat.vi
          .replace("Nhóm ", "")
          .replace(/^./, (c) => c.toUpperCase()),
        category: p.category,
      },
      { label: `${sequence.steps.length + 4} bước` },
      { label: "TS · Java" },
    ],
  });
}
