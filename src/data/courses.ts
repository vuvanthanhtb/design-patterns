/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { ARCH_GROUPS, ARCH_LESSONS } from "./arch";
import { CATEGORY_INFO } from "./meta";
import { ML_GROUPS, ML_LESSONS } from "./ml/lessons";
import { NAV_INDEX } from "./nav";

/** Sổ đăng ký các khoá học — dùng cho sidebar, header, tìm kiếm, sitemap. */
export type CourseId = "patterns" | "architecture" | "ml";

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
  architecture: {
    id: "architecture",
    title: "Architecture Patterns",
    short: "Mẫu kiến trúc",
    tagline:
      "14 mẫu kiến trúc phần mềm qua sơ đồ hệ thống có luồng dữ liệu động.",
    overview: "/architecture",
    cheatsheet: "/architecture/cheatsheet",
    languages: "TypeScript · Java",
    groups: (["app", "distributed", "data"] as const).map((g) => ({
      id: `arch-${g}`,
      label: ARCH_GROUPS[g].vi,
      color: `var(--cat-arch-${g})`,
    })),
    items: ARCH_LESSONS.map((l, i) => ({
      slug: l.slug,
      name: l.name,
      viName: l.viName,
      group: `arch-${l.group}`,
      intent: l.intent,
      num: String(i + 1).padStart(2, "0"),
      href: `/architecture/${l.slug}`,
      progressKey: `arch:${l.slug}`,
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

/** Thứ tự hiển thị: 01 Design Patterns · 02 Architecture Patterns · 03 Machine Learning. */
export const COURSE_LIST = [COURSES.patterns, COURSES.architecture, COURSES.ml];

/** Khoá học ứng với đường dẫn hiện tại (mặc định: Design Patterns). */
export function courseFromPath(path: string): Course {
  const seg = path.split("/")[1];
  if (seg === "ml") return COURSES.ml;
  if (seg === "architecture") return COURSES.architecture;
  return COURSES.patterns;
}

/** Slug bài học đang mở, nếu có. */
export function lessonFromPath(path: string): string | null {
  const m = path.match(/^\/(?:patterns|architecture|ml)\/([^/]+)$/);
  return m && m[1] !== "cheatsheet" ? m[1] : null;
}
