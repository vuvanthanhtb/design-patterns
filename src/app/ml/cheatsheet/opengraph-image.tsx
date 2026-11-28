/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Cheatsheet 11 thuật toán Machine Learning";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Tra cứu nhanh · Machine Learning",
    title: "Cheatsheet 11 thuật toán ML",
    subtitle:
      "Công thức cốt lõi, lớp scikit-learn tương ứng và khi nào nên dùng",
    meta: "Python · scikit-learn",
    chips: [
      { label: "Nền tảng", category: "foundation" },
      { label: "Có giám sát", category: "supervised" },
      { label: "Không giám sát", category: "unsupervised" },
    ],
  });
}
