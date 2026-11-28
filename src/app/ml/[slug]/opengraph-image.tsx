/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { getMlLesson, ML_GROUPS, ML_LESSONS } from "@/data/ml";
import { OG_SIZE, renderOg } from "@/lib/og";
import { buildViz } from "@/lib/ml/viz";

export const alt = "Bài học thuật toán Machine Learning";
export const size = OG_SIZE;
export const contentType = "image/png";

// Render sẵn ảnh cho cả 11 bài lúc build
export function generateStaticParams() {
  return ML_LESSONS.map((l) => ({ slug: l.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = getMlLesson(slug);
  if (!found)
    return renderOg({
      eyebrow: "Machine Learning",
      title: "Không tìm thấy",
      subtitle: "",
      chips: [],
    });
  const { lesson: l, index } = found;
  return renderOg({
    eyebrow: `Bài ${String(index + 1).padStart(2, "0")} / ${ML_LESSONS.length} · ${l.viName}`,
    title: l.name,
    subtitle: l.intent.length > 110 ? `${l.intent.slice(0, 108)}…` : l.intent,
    meta: "Python · NumPy · scikit-learn",
    chips: [
      { label: ML_GROUPS[l.group].vi, category: l.group },
      { label: l.task },
      { label: `${buildViz(slug).frames.length + 4} bước` },
    ],
  });
}
