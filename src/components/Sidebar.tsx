"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { CATEGORY_INFO } from "@/data/meta";
import { NAV_INDEX } from "@/data/nav";
import { readProgress, subscribeProgress } from "@/lib/progress";
import type { Category } from "@/lib/types";
import { Folder, IconCheck, IconChevron, IconFile } from "./Icons";

const ORDER: Category[] = ["creational", "structural", "behavioral"];
const COLORS: Record<Category, string> = {
  creational: "var(--cat-creational)",
  structural: "var(--cat-structural)",
  behavioral: "var(--cat-behavioral)",
};

let cache: { raw: string; value: string[] } = { raw: "", value: [] };
function snapshot() {
  const value = readProgress();
  const raw = value.join(",");
  if (raw !== cache.raw) cache = { raw, value };
  return cache.value;
}
const empty: string[] = [];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Sidebar() {
  const path = usePathname();
  const current = path.startsWith("/patterns/") ? path.split("/")[2] : null;
  const currentCat = NAV_INDEX.find((p) => p.slug === current)?.category;
  const done = useSyncExternalStore(subscribeProgress, snapshot, () => empty);
  const [toggled, setToggled] = useState<Partial<Record<Category, boolean>>>({});
  const isOpen = (c: Category) => toggled[c] ?? (currentCat ? c === currentCat : c === "creational");

  return (
    <aside className="sidebar" aria-label="Khoá học">
      <div className="course-head">
        <Folder color="var(--ink)" />
        <span>Khoá học</span>
        <span className="muted">{NAV_INDEX.length} bài</span>
      </div>
      <ul className="tree">
        {ORDER.map((cat, ci) => {
          const items = NAV_INDEX.filter((p) => p.category === cat);
          const count = items.filter((p) => done.includes(p.slug)).length;
          const open = isOpen(cat);
          return (
            <li key={cat}>
              <button type="button" className="tree-group" aria-expanded={open} onClick={() => setToggled((t) => ({ ...t, [cat]: !open }))}>
                <span className={`chev${open ? " open" : ""}`}>
                  <IconChevron size={12} />
                </span>
                <Folder color={COLORS[cat]} />
                <span className="tree-title">
                  {String(ci + 1).padStart(2, "0")}. {cap(CATEGORY_INFO[cat].vi.replace("Nhóm ", ""))}
                </span>
                <span className="muted">
                  {count}/{items.length}
                </span>
              </button>
              {open && (
                <ul className="tree-items">
                  {items.map((p) => {
                    const on = p.slug === current;
                    const ok = done.includes(p.slug);
                    return (
                      <li key={p.slug}>
                        <Link href={`/patterns/${p.slug}`} className={`tree-item${on ? " on" : ""}`} aria-current={on ? "page" : undefined}>
                          <span className={`file${ok ? " ok" : ""}`}>{ok ? <IconCheck size={12} /> : <IconFile size={12} />}</span>
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
          <i style={{ width: `${(done.length / NAV_INDEX.length) * 100}%` }} />
        </span>
        <b>
          {done.length} / {NAV_INDEX.length}
        </b>
      </div>
    </aside>
  );
}
