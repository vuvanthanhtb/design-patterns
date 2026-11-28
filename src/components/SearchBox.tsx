/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { COURSE_LIST } from "@/data/courses";
import { IconSearch } from "./Icons";

const ALL = COURSE_LIST.flatMap((c) =>
  c.items.map((it) => ({ ...it, course: c.title })),
);

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const k = fold(q.trim());
    if (!k) return ALL.filter((_, i) => i % 3 === 0).slice(0, 8);
    return ALL.filter((p) =>
      fold(`${p.name} ${p.viName} ${p.intent} ${p.course}`).includes(k),
    ).slice(0, 8);
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    input.current?.blur();
    router.push(href);
  };

  return (
    <div
      className="search"
      onBlur={(e) =>
        !e.currentTarget.contains(e.relatedTarget) && setOpen(false)
      }
    >
      <IconSearch />
      <input
        ref={input}
        value={q}
        placeholder="Tìm bài học…"
        aria-label="Tìm bài học"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            go(results[active].href);
          } else if (e.key === "Escape") {
            setOpen(false);
            input.current?.blur();
          }
        }}
      />
      <kbd>⌘K</kbd>
      {open && (
        <ul className="search-results" role="listbox">
          {results.length === 0 && (
            <li className="search-empty">Không tìm thấy bài học nào</li>
          )}
          {results.map((r, i) => (
            <li key={r.href} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={i === active ? "on" : undefined}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.href)}
              >
                <span className={`dot cat-${r.group}`} />
                <span className="sr-num">{r.num}</span>
                <span className="sr-name">{r.name}</span>
                <span className="sr-vi">
                  {r.course} · {r.viName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
