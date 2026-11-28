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
    eyebrow: "3 khoá học · 48 bài · miễn phí",
    title: "Học bằng sơ đồ động",
    subtitle: "Design Patterns · Architecture Patterns · Machine Learning",
    chips: [
      { label: "23 mẫu GoF", category: "structural" },
      { label: "14 mẫu kiến trúc", category: "behavioral" },
      { label: "11 thuật toán ML", category: "supervised" },
    ],
  });
}
