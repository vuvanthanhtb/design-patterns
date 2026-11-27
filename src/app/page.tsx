/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import Link from "next/link";
import { UmlDiagram } from "@/components/UmlDiagram";
import { CATEGORY_INFO } from "@/data/meta";
import { number, PATTERNS } from "@/data/patterns";
import { SEQUENCES } from "@/data/sequences";
import type { Category } from "@/lib/types";

const ORDER: Category[] = ["creational", "structural", "behavioral"];

export default function Overview() {
  return (
    <div className="overview">
      <section className="card hero">
        <p className="crumb">Khoá học · 23 bài · TypeScript & Java</p>
        <h1>
          Học <mark>Design Patterns</mark> bằng sơ đồ động
        </h1>
        <p className="subtitle">
          Mỗi mẫu là một bài học từng bước: vấn đề → cấu trúc lớp UML → sơ đồ
          tuần tự chạy từng thông điệp → code TypeScript & Java với output thật
          → tổng kết.
        </p>
        <div className="hero-actions">
          <Link href="/patterns/factory-method" className="btn btn-green">
            Bắt đầu bài 01 →
          </Link>
          <Link href="/cheatsheet" className="btn">
            Xem cheatsheet
          </Link>
        </div>
      </section>

      {ORDER.map((cat, ci) => (
        <section key={cat} id={cat} className="ov-group">
          <header>
            <span className={`dot cat-${cat}`} />
            <h2>
              {String(ci + 1).padStart(2, "0")}. {CATEGORY_INFO[cat].vi}
            </h2>
            <span className="muted">{CATEGORY_INFO[cat].label}</span>
          </header>
          <p className="muted ov-blurb">{CATEGORY_INFO[cat].blurb}</p>
          <ul className="ov-grid">
            {PATTERNS.map((p, i) =>
              p.category !== cat ? null : (
                <li key={p.slug}>
                  <Link href={`/patterns/${p.slug}`} className="ov-card card">
                    <div className="ov-thumb">
                      <UmlDiagram
                        diagram={p.diagram}
                        id={`th-${p.slug}`}
                        title={`Sơ đồ ${p.name}`}
                        legend={false}
                      />
                    </div>
                    <div className="ov-body">
                      <div className="ov-meta">
                        <span className="num">{number(i)}</span>
                        <span className="chip chip-violet">
                          {SEQUENCES[p.slug].steps.length + 4} bước
                        </span>
                      </div>
                      <h3>{p.name}</h3>
                      <p className="vi">{p.viName}</p>
                      <p className="intent">{p.intent}</p>
                    </div>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
