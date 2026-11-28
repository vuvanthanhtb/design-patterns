/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { ARCH_GROUPS, ARCH_LESSONS, getArchLesson } from "@/data/arch";
import { renderOg } from "@/lib/og";

// Ảnh chia sẻ 1200×630 — route handler + generateStaticParams nên được render sẵn cho cả 14 bài lúc build
export function generateStaticParams() {
  return ARCH_LESSONS.map((l) => ({ slug: l.slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const found = getArchLesson(slug);
  if (!found)
    return renderOg({
      eyebrow: "Architecture Patterns",
      title: "Không tìm thấy",
      subtitle: "",
      chips: [],
    });
  const { lesson: l, index } = found;
  return renderOg({
    eyebrow: `Bài ${String(index + 1).padStart(2, "0")} / ${ARCH_LESSONS.length} · ${l.viName}`,
    title: l.name,
    subtitle: l.intent.length > 110 ? `${l.intent.slice(0, 108)}…` : l.intent,
    meta: "TypeScript · Java",
    chips: [
      { label: ARCH_GROUPS[l.group].vi, category: `arch-${l.group}` },
      { label: `${l.diagram.nodes.length} thành phần` },
      { label: `${l.flow.length + 4} bước` },
    ],
  });
}
