/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { OG_SIZE, renderOg } from "@/lib/og";

export const alt =
  "Machine Learning cơ bản — 11 thuật toán với mô phỏng từng bước và Python";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Khoá học 03 · 11 bài",
    title: "Machine Learning cơ bản",
    subtitle:
      "Mô phỏng từng bước · cài đặt từ đầu bằng NumPy · đối chiếu scikit-learn",
    meta: "Python",
    chips: [
      { label: "1 Nền tảng", category: "foundation" },
      { label: "8 Có giám sát", category: "supervised" },
      { label: "2 Không giám sát", category: "unsupervised" },
    ],
  });
}
