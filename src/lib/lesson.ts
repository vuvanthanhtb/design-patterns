/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Pattern, Sequence } from "./types";

export type LessonStep =
  | { kind: "problem"; label: string; badge: "VẤN ĐỀ" }
  | { kind: "structure"; label: string; badge: "CẤU TRÚC" }
  | { kind: "flow"; label: string; badge: "LUỒNG CHẠY"; index: number }
  | { kind: "code"; label: string; badge: "CODE" }
  | { kind: "recap"; label: string; badge: "TỔNG KẾT" };

/** Mỗi mẫu là một bài học: vấn đề → cấu trúc → từng bước chạy → code → tổng kết. */
export function buildLessonSteps(_p: Pattern, seq: Sequence): LessonStep[] {
  return [
    { kind: "problem", label: "Vấn đề", badge: "VẤN ĐỀ" },
    { kind: "structure", label: "Cấu trúc", badge: "CẤU TRÚC" },
    ...seq.steps.map((s, index) => ({
      kind: "flow" as const,
      label: s.title,
      badge: "LUỒNG CHẠY" as const,
      index,
    })),
    { kind: "code", label: "Code", badge: "CODE" },
    { kind: "recap", label: "Tổng kết", badge: "TỔNG KẾT" },
  ];
}

/** Ước lượng thời gian học: ~1 phút mỗi bước, tối thiểu 5. */
export const lessonMinutes = (steps: number) => Math.max(5, steps + 2);
