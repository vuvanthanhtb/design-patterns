/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { OG_SIZE, renderOg } from "@/lib/og";

export const alt =
  "Architecture Patterns — 14 mẫu kiến trúc phần mềm với sơ đồ luồng dữ liệu động";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Khoá học 02 · 14 bài",
    title: "14 mẫu kiến trúc",
    subtitle:
      "Sơ đồ hệ thống có luồng dữ liệu động · sa bàn 3D · TypeScript & Java",
    meta: "TypeScript · Java",
    chips: [
      { label: "4 Cấu trúc", category: "arch-app" },
      { label: "5 Phân tán", category: "arch-distributed" },
      { label: "5 Dữ liệu & vận hành", category: "arch-data" },
    ],
  });
}
