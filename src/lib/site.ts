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
  name: "Design Patterns",
  title: "Design Patterns · 23 mẫu GoF với sơ đồ UML động",
  description:
    "Khoá học tương tác 23 mẫu thiết kế GoF (Creational, Structural, Behavioral): sơ đồ lớp UML, sơ đồ tuần tự động từng bước, ví dụ TypeScript và Java chạy được kèm output thật.",
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
