/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

/**
 * Cấu hình SEO dùng chung. URL gốc lấy từ biến môi trường SITE_URL lúc build
 * (các trang được prerender tĩnh nên URL tuyệt đối được ghi vào HTML khi build).
 */
const rawUrl =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

export const SITE = {
  name: "Học trực quan",
  title: "Học trực quan · Design Patterns & Machine Learning bằng sơ đồ động",
  description:
    "Hai khoá học lập trình tương tác bằng sơ đồ động: 23 mẫu thiết kế GoF (TypeScript, Java) và 11 thuật toán Machine Learning cơ bản (Python, NumPy, scikit-learn). Mô phỏng từng bước, code chạy thật kèm output.",
  url: rawUrl.replace(/\/+$/, ""),
  locale: "vi_VN",
  language: "vi",
  author: "vuvanthanhtb",
  keywords: [
    "design patterns",
    "mẫu thiết kế",
    "GoF",
    "Gang of Four",
    "UML",
    "sơ đồ lớp",
    "sơ đồ tuần tự",
    "TypeScript",
    "Java",
    "Python",
    "machine learning",
    "học máy",
    "scikit-learn",
    "lập trình hướng đối tượng",
    "OOP",
    "kiến trúc phần mềm",
  ],
} as const;

/**
 * Next.js thay thế nguyên object `openGraph` của layout khi trang con khai báo lại,
 * nên mỗi trang phải spread phần chung này để giữ og:site_name / og:locale.
 */
export const OG_BASE = { siteName: SITE.name, locale: SITE.locale } as const;

export const absoluteUrl = (path = "/") =>
  new URL(path, `${SITE.url}/`).toString();

/** Chuỗi JSON-LD an toàn để nhúng vào <script> (chống chèn thẻ HTML). */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
