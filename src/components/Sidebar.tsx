/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { COURSE_LIST, courseFromPath, lessonFromPath } from "@/data/courses";
import { readProgress, subscribeProgress } from "@/lib/progress";
import { Folder, IconCheck, IconChevron, IconFile } from "./Icons";

let cache: { raw: string; value: string[] } = { raw: "", value: [] };
function snapshot() {
  const value = readProgress();
  const raw = value.join(",");
  if (raw !== cache.raw) cache = { raw, value };
  return cache.value;
}
const empty: string[] = [];

export function Sidebar() {
  const path = usePathname();
  const course = courseFromPath(path);
  const current = lessonFromPath(path);
  const currentGroup = course.items.find((p) => p.slug === current)?.group;
  const done = useSyncExternalStore(subscribeProgress, snapshot, () => empty);
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isOpen = (g: string) =>
    toggled[`${course.id}:${g}`] ??
    (currentGroup ? g === currentGroup : g === course.groups[0].id);
  const doneCount = course.items.filter((p) =>
    done.includes(p.progressKey),
  ).length;

  return (
    <aside className="sidebar" aria-label="Khoá học">
      <nav className="course-switch" aria-label="Chọn khoá học">
        <p className="side-label">Khoá học</p>
        <ul>
          {COURSE_LIST.map((c, i) => {
            const on = c.id === course.id;
            return (
              <li key={c.id}>
                <Link
                  href={c.overview}
                  className={`course-pick${on ? " on" : ""}`}
                  aria-current={on ? "true" : undefined}
                >
                  <span className="course-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="course-text">
                    <b>{c.title}</b>
                    <small>
                      {c.items.length} bài · {c.languages}
                    </small>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="course-head">
        <Folder color="var(--ink)" />
        <span>{course.short}</span>
        <span className="muted">Nội dung</span>
      </div>
      <ul className="tree">
        {course.groups.map((g, gi) => {
          const items = course.items.filter((p) => p.group === g.id);
          const count = items.filter((p) =>
            done.includes(p.progressKey),
          ).length;
          const open = isOpen(g.id);
          return (
            <li key={g.id}>
              <button
                type="button"
                className="tree-group"
                aria-expanded={open}
                onClick={() =>
                  setToggled((t) => ({ ...t, [`${course.id}:${g.id}`]: !open }))
                }
              >
                <span className={`chev${open ? " open" : ""}`}>
                  <IconChevron size={12} />
                </span>
                <Folder color={g.color} />
                <span className="tree-title">
                  {String(gi + 1).padStart(2, "0")}. {g.label}
                </span>
                <span className="muted">
                  {count}/{items.length}
                </span>
              </button>
              {open && (
                <ul className="tree-items">
                  {items.map((p) => {
                    const on = p.slug === current;
                    const ok = done.includes(p.progressKey);
                    return (
                      <li key={p.slug}>
                        <Link
                          href={p.href}
                          className={`tree-item${on ? " on" : ""}`}
                          aria-current={on ? "page" : undefined}
                        >
                          <span className={`file${ok ? " ok" : ""}`}>
                            {ok ? (
                              <IconCheck size={12} />
                            ) : (
                              <IconFile size={12} />
                            )}
                          </span>
                          {p.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <div className="progress-box">
        <span>TIẾN ĐỘ</span>
        <span className="progress-bar" aria-hidden>
          <i style={{ width: `${(doneCount / course.items.length) * 100}%` }} />
        </span>
        <b>
          {doneCount} / {course.items.length}
        </b>
      </div>
    </aside>
  );
}
