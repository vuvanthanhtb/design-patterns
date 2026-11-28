/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";

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
  title: "Học trực quan: Design Patterns, Kiến trúc, Machine Learning",
  description:
    "3 khoá học lập trình bằng sơ đồ động: 23 mẫu thiết kế GoF, 14 mẫu kiến trúc, 11 thuật toán Machine Learning. Code TypeScript, Java, Python chạy thật.",
  /** Ngày cập nhật nội dung — dùng cho sitemap và dateModified. */
  updated: "2026-11-29",
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
    "architecture patterns",
    "mẫu kiến trúc",
    "microservices",
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

/* ───────────── Metadata dùng chung cho mọi trang ───────────── */

const TITLE_MAX = 65;
const DESC_MAX = 160;

/** Chọn phương án tiêu đề dài nhất mà vẫn ≤ 65 ký tự (Google cắt khoảng 60–65). */
export function fitTitle(candidates: string[]) {
  return (
    candidates.find((t) => t.length <= TITLE_MAX) ??
    candidates[candidates.length - 1]
  );
}

/** Cắt mô tả ≤ 160 ký tự tại ranh giới từ. */
export function fitDescription(...parts: string[]) {
  const full = parts.join(" ").replace(/\s+/g, " ").trim();
  if (full.length <= DESC_MAX) return full;
  const first = parts[0].trim();
  if (first.length <= DESC_MAX) return first;
  const cut = first.slice(0, DESC_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

interface PageMetaInput {
  /** Tiêu đề đầy đủ (không thêm hậu tố tên site). */
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  section?: string;
  keywords?: string[];
  /** Ảnh chia sẻ riêng (khi segment không dùng file opengraph-image). */
  image?: { url: string; alt: string };
}

/**
 * Metadata đồng bộ cho một trang: title, description, canonical, Open Graph và Twitter
 * luôn khớp nhau. (Next.js thay nguyên object `openGraph`/`twitter` của layout khi trang
 * khai báo lại, nên mọi trường phải được điền đủ ở đây.)
 * Ảnh chia sẻ lấy từ file `opengraph-image` của segment — không khai báo ở đây để
 * không ghi đè ảnh riêng của từng bài.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  section,
  keywords,
  image,
}: PageMetaInput): Metadata {
  const images = image
    ? [
        {
          url: image.url,
          alt: image.alt,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ]
    : undefined;
  return {
    title: { absolute: title },
    description,
    keywords: keywords ? [...keywords, ...SITE.keywords] : undefined,
    // Một ngôn ngữ duy nhất: khai báo rõ vi-VN và x-default trỏ cùng URL
    alternates: {
      canonical: path,
      languages: { "vi-VN": path, "x-default": path },
    },
    openGraph: {
      ...OG_BASE,
      type,
      url: path,
      title,
      description,
      ...(type === "article"
        ? { section, authors: [SITE.author], modifiedTime: SITE.updated }
        : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

/* ───────────── Dữ liệu có cấu trúc (schema.org) dùng chung ───────────── */

/** Đơn vị cung cấp khoá học — Google yêu cầu Organization cho Course rich results. */
export const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: `${SITE.url}/`,
  logo: `${SITE.url}/icon.svg`,
  founder: { "@type": "Person", name: SITE.author },
} as const;

export const breadcrumb = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});

/** Code mẫu chạy được của một bài học (schema.org SoftwareSourceCode). */
export const codeSamples = (
  lessonUrl: string,
  lessonName: string,
  langs: { language: string; runtime: string; file: string }[],
) =>
  langs.map((l) => ({
    "@type": "SoftwareSourceCode",
    "@id": `${lessonUrl}#code-${l.language.toLowerCase()}`,
    name: `${lessonName} — ví dụ ${l.language}`,
    description: `Ví dụ ${l.language} chạy được (${l.file}) kèm output thật.`,
    programmingLanguage: l.language,
    runtimePlatform: l.runtime,
    codeSampleType: "full solution",
    inLanguage: SITE.language,
    isPartOf: { "@id": `${lessonUrl}#lesson` },
    author: { "@type": "Person", name: SITE.author },
  }));
