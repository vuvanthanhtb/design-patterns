/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { OG_SIZE, renderOg } from "@/lib/og";

export const alt =
  "Học trực quan — Design Patterns và Machine Learning bằng sơ đồ động";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "2 khoá học · 34 bài · miễn phí",
    title: "Học bằng sơ đồ động",
    subtitle: "Design Patterns (TypeScript, Java) · Machine Learning (Python)",
    chips: [
      { label: "23 mẫu GoF", category: "structural" },
      { label: "11 thuật toán ML", category: "supervised" },
    ],
  });
}
