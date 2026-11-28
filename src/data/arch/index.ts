/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { ArchGroup, ArchLesson } from "@/lib/arch/types";
import { appLessons } from "./app";
import { dataLessons } from "./data";
import { distributedLessons } from "./distributed";

export const ARCH_GROUPS: Record<
  ArchGroup,
  { label: string; vi: string; blurb: string }
> = {
  app: {
    label: "Application structure",
    vi: "Cấu trúc ứng dụng",
    blurb:
      "Tổ chức code bên trong một ứng dụng: tầng, vòng, port — sao cho nghiệp vụ không bị trói vào framework.",
  },
  distributed: {
    label: "Distributed systems",
    vi: "Hệ phân tán",
    blurb:
      "Nhiều service giao tiếp qua mạng: chia tách, định tuyến, sự kiện và hạ tầng mạng.",
  },
  data: {
    label: "Data & operations",
    vi: "Dữ liệu & vận hành",
    blurb:
      "Quản lý dữ liệu xuyên service, chịu lỗi và hiện đại hoá hệ thống đang chạy.",
  },
};

export const ARCH_GROUP_NUM: Record<ArchGroup, string> = {
  app: "01",
  distributed: "02",
  data: "03",
};

/** Toàn bộ nội dung là hằng số trong mã nguồn — không gọi API. */
export const ARCH_LESSONS: ArchLesson[] = [
  ...appLessons,
  ...distributedLessons,
  ...dataLessons,
];

export function getArchLesson(slug: string) {
  const index = ARCH_LESSONS.findIndex((l) => l.slug === slug);
  if (index === -1) return null;
  return {
    lesson: ARCH_LESSONS[index],
    index,
    prev: ARCH_LESSONS[index - 1] ?? null,
    next: ARCH_LESSONS[index + 1] ?? null,
  };
}
