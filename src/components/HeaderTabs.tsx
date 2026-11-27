/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBook, IconGrid, IconSheet } from "./Icons";

export function HeaderTabs() {
  const path = usePathname();
  const tabs = [
    {
      href: path.startsWith("/patterns/") ? path : "/patterns/factory-method",
      label: "Học",
      icon: <IconBook />,
      on: path.startsWith("/patterns/"),
    },
    { href: "/", label: "Tổng quan", icon: <IconGrid />, on: path === "/" },
    {
      href: "/cheatsheet",
      label: "Cheatsheet",
      icon: <IconSheet />,
      on: path === "/cheatsheet",
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
