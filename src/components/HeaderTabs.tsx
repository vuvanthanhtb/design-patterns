/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { courseFromPath, lessonFromPath } from "@/data/courses";
import { IconBook, IconGrid, IconLayers, IconSheet } from "./Icons";

export function HeaderTabs() {
  const path = usePathname();
  const course = courseFromPath(path);
  const inLesson = lessonFromPath(path) !== null;
  const tabs = [
    { href: "/", label: "Khoá học", icon: <IconLayers />, on: path === "/" },
    {
      href: inLesson ? path : course.items[0].href,
      label: "Học",
      icon: <IconBook />,
      on: inLesson,
    },
    {
      href: course.overview,
      label: "Tổng quan",
      icon: <IconGrid />,
      on: path === course.overview,
    },
    {
      href: course.cheatsheet,
      label: "Cheatsheet",
      icon: <IconSheet />,
      on: path === course.cheatsheet,
    },
  ];
  return (
    <nav className="tabs" aria-label="Điều hướng chính">
      {tabs.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          className={`tab${t.on ? " on" : ""}`}
          aria-current={t.on ? "page" : undefined}
        >
          {t.icon}
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
