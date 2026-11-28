/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Cheatsheet 23 mẫu thiết kế GoF";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Tra cứu nhanh · Design Patterns",
    title: "Cheatsheet 23 mẫu GoF",
    subtitle: "Ý định và tín hiệu nhận biết khi nào nên dùng từng mẫu",
    meta: "TypeScript · Java",
    chips: [
      { label: "Khởi tạo", category: "creational" },
      { label: "Cấu trúc", category: "structural" },
      { label: "Hành vi", category: "behavioral" },
    ],
  });
}
