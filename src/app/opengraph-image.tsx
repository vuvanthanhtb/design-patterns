/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { OG_SIZE, renderOg } from "@/lib/og";

export const alt =
  "Design Patterns — 23 mẫu GoF với sơ đồ UML động, TypeScript và Java";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Khoá học tương tác · 23 bài",
    title: "23 mẫu thiết kế GoF",
    subtitle: "Sơ đồ lớp UML · sơ đồ tuần tự động · code TypeScript & Java",
    chips: [
      { label: "5 Khởi tạo", category: "creational" },
      { label: "7 Cấu trúc", category: "structural" },
      { label: "11 Hành vi", category: "behavioral" },
    ],
  });
}
