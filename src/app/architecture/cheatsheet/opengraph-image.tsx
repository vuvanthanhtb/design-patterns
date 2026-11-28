/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Cheatsheet 14 mẫu kiến trúc phần mềm";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Tra cứu nhanh · Architecture Patterns",
    title: "Cheatsheet 14 mẫu kiến trúc",
    subtitle: "Ý định, đánh đổi chính và khi nào nên dùng từng mẫu",
    meta: "TypeScript · Java",
    chips: [
      { label: "Cấu trúc ứng dụng", category: "arch-app" },
      { label: "Hệ phân tán", category: "arch-distributed" },
      { label: "Dữ liệu & vận hành", category: "arch-data" },
    ],
  });
}
