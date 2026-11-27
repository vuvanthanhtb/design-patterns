import { behavioral } from "./behavioral";
import { creational } from "./creational";
import type { PatternMeta } from "./meta";
import { structural } from "./structural";

/** Toàn bộ dữ liệu là hằng số trong mã nguồn — không gọi API. */
export const PATTERNS: PatternMeta[] = [...creational, ...structural, ...behavioral];

export const number = (i: number) => String(i + 1).padStart(2, "0");

/** Chỉ mục nhẹ cho thanh điều hướng và ô tìm kiếm (client). */
export const NAV_INDEX = PATTERNS.map((p, i) => ({
  slug: p.slug,
  name: p.name,
  viName: p.viName,
  category: p.category,
  intent: p.intent,
  num: number(i),
}));
export type NavItem = (typeof NAV_INDEX)[number];
