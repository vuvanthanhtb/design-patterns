/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Plot } from "@/components/ml/Plot";
import { UmlDiagram } from "@/components/UmlDiagram";
import { COURSE_LIST } from "@/data/courses";
import { PATTERNS } from "@/data/patterns";
import { buildViz } from "@/lib/ml/viz";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: absoluteUrl("/"),
      name: SITE.name,
      description: SITE.description,
      inLanguage: SITE.language,
      author: { "@type": "Person", name: SITE.author },
    },
    {
      "@type": "ItemList",
      name: "Các khoá học",
      itemListElement: COURSE_LIST.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(c.overview),
        name: c.title,
      })),
    },
  ],
};

export default function Home() {
  const kmeans = buildViz("k-means");
  const previews = {
    patterns: (
      <UmlDiagram
        diagram={PATTERNS.find((p) => p.slug === "observer")!.diagram}
        id="home-uml"
        title="Sơ đồ lớp Observer"
        legend={false}
      />
    ),
    ml: (
      <Plot
        id="home-ml"
        viz={kmeans}
        frame={kmeans.frames[kmeans.frames.length - 1]}
        title="K-Means hội tụ"
        compact
      />
    ),
  };
  return (
    <div className="overview">
      <JsonLd data={structuredData} />
      <section className="card hero">
        <p className="crumb">
          {COURSE_LIST.length} khoá học ·{" "}
          {COURSE_LIST.reduce((s, c) => s + c.items.length, 0)} bài · miễn phí
        </p>
        <h1>
          Học lập trình bằng <mark>sơ đồ động</mark>
        </h1>
        <p className="subtitle">
          Mỗi bài là một chuỗi bước có hoạt ảnh: vấn đề → ý tưởng → mô phỏng
          từng bước → code chạy thật → tổng kết. Toàn bộ nội dung và dữ liệu
          được ghi sẵn, không cần đăng nhập.
        </p>
      </section>

      <ul className="course-grid">
        {COURSE_LIST.map((c, i) => (
          <li key={c.id}>
            <article className="card course-card">
              <Link
                href={c.overview}
                className="course-thumb"
                aria-label={`Xem khoá ${c.title}`}
              >
                {previews[c.id]}
              </Link>
              <div className="course-body">
                <p className="crumb">
                  Khoá {String(i + 1).padStart(2, "0")} · {c.items.length} bài ·{" "}
                  {c.languages}
                </p>
                <h2>
                  <Link href={c.overview}>{c.title}</Link>
                </h2>
                <p className="subtitle">{c.tagline}</p>
                <div className="pill-row left">
                  {c.groups.map((g) => (
                    <span key={g.id} className={`chip chip-cat cat-${g.id}`}>
                      {g.label} ·{" "}
                      {c.items.filter((it) => it.group === g.id).length}
                    </span>
                  ))}
                </div>
                <div className="hero-actions">
                  <Link href={c.items[0].href} className="btn btn-green">
                    Bắt đầu bài 01 →
                  </Link>
                  <Link href={c.overview} className="btn">
                    Tổng quan
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
