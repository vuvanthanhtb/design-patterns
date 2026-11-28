/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { CATEGORY_INFO } from "./meta";
import { ML_GROUPS, ML_LESSONS } from "./ml/lessons";
import { NAV_INDEX } from "./nav";

/** Sổ đăng ký các khoá học — dùng cho sidebar, header, tìm kiếm, sitemap. */
export type CourseId = "patterns" | "ml";

export interface CourseItem {
  slug: string;
  name: string;
  viName: string;
  group: string;
  intent: string;
  num: string;
  href: string;
  /** Khoá lưu tiến độ trong localStorage. */
  progressKey: string;
}

export interface Course {
  id: CourseId;
  title: string;
  short: string;
  tagline: string;
  overview: string;
  cheatsheet: string;
  languages: string;
  groups: { id: string; label: string; color: string }[];
  items: CourseItem[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const COURSES: Record<CourseId, Course> = {
  patterns: {
    id: "patterns",
    title: "Design Patterns",
    short: "Mẫu thiết kế GoF",
    tagline: "23 mẫu thiết kế GoF qua sơ đồ UML và sơ đồ tuần tự động.",
    overview: "/patterns",
    cheatsheet: "/cheatsheet",
    languages: "TypeScript · Java",
    groups: (["creational", "structural", "behavioral"] as const).map((c) => ({
      id: c,
      label: cap(CATEGORY_INFO[c].vi.replace("Nhóm ", "")),
      color: `var(--cat-${c})`,
    })),
    items: NAV_INDEX.map((p) => ({
      slug: p.slug,
      name: p.name,
      viName: p.viName,
      group: p.category,
      intent: p.intent,
      num: p.num,
      href: `/patterns/${p.slug}`,
      progressKey: p.slug,
    })),
  },
  ml: {
    id: "ml",
    title: "Machine Learning",
    short: "Thuật toán ML",
    tagline: "11 thuật toán học máy nền tảng qua biểu đồ mô phỏng từng bước.",
    overview: "/ml",
    cheatsheet: "/ml/cheatsheet",
    languages: "Python",
    groups: (["foundation", "supervised", "unsupervised"] as const).map(
      (g) => ({
        id: g,
        label: cap(ML_GROUPS[g].vi.replace("Học ", "")),
        color: `var(--cat-${g})`,
      }),
    ),
    items: ML_LESSONS.map((l, i) => ({
      slug: l.slug,
      name: l.name,
      viName: l.viName,
      group: l.group,
      intent: l.intent,
      num: String(i + 1).padStart(2, "0"),
      href: `/ml/${l.slug}`,
      progressKey: `ml:${l.slug}`,
    })),
  },
};

export const COURSE_LIST = [COURSES.patterns, COURSES.ml];

/** Khoá học ứng với đường dẫn hiện tại (mặc định: Design Patterns). */
export function courseFromPath(path: string): Course {
  return path === "/ml" || path.startsWith("/ml/")
    ? COURSES.ml
    : COURSES.patterns;
}

/** Slug bài học đang mở, nếu có. */
export function lessonFromPath(path: string): string | null {
  const m = path.match(/^\/(?:patterns|ml)\/([^/]+)$/);
  return m && m[1] !== "cheatsheet" ? m[1] : null;
}
