/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArchDiagram } from "@/components/arch/ArchDiagram";
import { JsonLd } from "@/components/JsonLd";
import { ARCH_GROUPS, ARCH_LESSONS } from "@/data/arch";
import type { ArchGroup } from "@/lib/arch/types";
import {
  ORGANIZATION,
  SITE,
  absoluteUrl,
  breadcrumb,
  pageMetadata,
} from "@/lib/site";

const ORDER: ArchGroup[] = ["app", "distributed", "data"];
const TITLE = "Architecture Patterns: 14 mẫu kiến trúc phần mềm";
const DESC =
  "Khoá học 14 mẫu kiến trúc phần mềm: Layered, Hexagonal, Microservices, CQRS, Saga… qua sơ đồ luồng dữ liệu động, code TypeScript và Java chạy thật.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESC,
  path: "/architecture",
});

const mainEntity = {
  "@type": "Course",
  "@id": absoluteUrl("/architecture#course"),
  name: TITLE,
  description: DESC,
  url: absoluteUrl("/architecture"),
  inLanguage: SITE.language,
  isAccessibleForFree: true,
  educationalLevel: "Intermediate",
  teaches: "Các mẫu kiến trúc phần mềm với TypeScript và Java",
  provider: ORGANIZATION,
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
  hasPart: ARCH_LESSONS.map((l) => ({
    "@type": "LearningResource",
    name: `${l.name} — ${l.viName}`,
    url: absoluteUrl(`/architecture/${l.slug}`),
  })),
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    mainEntity,
    breadcrumb([
      { name: SITE.name, path: "/" },
      { name: "Architecture Patterns", path: "/architecture" },
    ]),
  ],
};

export default function ArchOverview() {
  return (
    <div className="overview">
      <JsonLd data={structuredData} />
      <section className="card hero">
        <p className="crumb">
          Khoá học 02 · {ARCH_LESSONS.length} bài · TypeScript & Java
        </p>
        <h1>
          Học <mark>Architecture Patterns</mark> bằng luồng dữ liệu
        </h1>
        <p className="subtitle">
          Mỗi mẫu là một sơ đồ hệ thống: request, sự kiện và lỗi chạy qua từng
          thành phần theo từng bước. Xem ở dạng 2D hoặc sa bàn 3D, kèm code
          TypeScript & Java mô phỏng chạy thật.
        </p>
        <div className="hero-actions">
          <Link
            href={`/architecture/${ARCH_LESSONS[0].slug}`}
            className="btn btn-green"
          >
            Bắt đầu bài 01 →
          </Link>
          <Link href="/architecture/cheatsheet" className="btn">
            Xem cheatsheet
          </Link>
        </div>
      </section>

      {ORDER.map((g, gi) => (
        <section key={g} id={g} className="ov-group">
          <header>
            <span className={`dot cat-arch-${g}`} />
            <h2>
              {String(gi + 1).padStart(2, "0")}. {ARCH_GROUPS[g].vi}
            </h2>
            <span className="muted">{ARCH_GROUPS[g].label}</span>
          </header>
          <p className="muted ov-blurb">{ARCH_GROUPS[g].blurb}</p>
          <ul className="ov-grid">
            {ARCH_LESSONS.map((l, i) =>
              l.group !== g ? null : (
                <li key={l.slug}>
                  <Link
                    href={`/architecture/${l.slug}`}
                    className="ov-card card"
                  >
                    <div className="ov-thumb">
                      <ArchDiagram
                        diagram={l.diagram}
                        id={`th-${l.slug}`}
                        title={`Sơ đồ ${l.name}`}
                      />
                    </div>
                    <div className="ov-body">
                      <div className="ov-meta">
                        <span className="num">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="chip chip-violet">
                          {l.flow.length + 4} bước
                        </span>
                      </div>
                      <h3>{l.name}</h3>
                      <p className="vi">{l.viName}</p>
                      <p className="intent">{l.intent}</p>
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
