/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { UmlDiagram } from "@/components/UmlDiagram";
import { CATEGORY_INFO } from "@/data/meta";
import { number, PATTERNS } from "@/data/patterns";
import { SEQUENCES } from "@/data/sequences";
import { absoluteUrl, OG_BASE, SITE } from "@/lib/site";
import type { Category } from "@/lib/types";

const ORDER: Category[] = ["creational", "structural", "behavioral"];

const COURSE_TITLE = "Design Patterns — 23 mẫu thiết kế GoF";
const COURSE_DESC =
  "Khoá học tương tác 23 mẫu thiết kế GoF: sơ đồ lớp UML, sơ đồ tuần tự động từng bước, ví dụ TypeScript và Java chạy được kèm output thật.";

export const metadata: Metadata = {
  title: COURSE_TITLE,
  description: COURSE_DESC,
  alternates: { canonical: "/patterns" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    url: "/patterns",
    title: COURSE_TITLE,
    description: COURSE_DESC,
  },
};

/** schema.org: khoá học gồm 23 bài (mỗi bài là một LearningResource). */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Course",
  "@id": absoluteUrl("/patterns#course"),
  name: COURSE_TITLE,
  description: COURSE_DESC,
  url: absoluteUrl("/patterns"),
  inLanguage: SITE.language,
  isAccessibleForFree: true,
  educationalLevel: "Intermediate",
  teaches: "23 mẫu thiết kế GoF với TypeScript và Java",
  provider: { "@type": "Person", name: SITE.author },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: "PT4H",
  },
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "VND",
    category: "Free",
  },
  hasPart: PATTERNS.map((p) => ({
    "@type": "LearningResource",
    name: `${p.name} — ${p.viName}`,
    url: absoluteUrl(`/patterns/${p.slug}`),
  })),
};

export default function Overview() {
  return (
    <div className="overview">
      <JsonLd data={structuredData} />
      <section className="card hero">
        <p className="crumb">Khoá học 01 · 23 bài · TypeScript & Java</p>
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
