/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Plot } from "@/components/ml/Plot";
import { ML_GROUPS, ML_LESSONS } from "@/data/ml";
import { buildViz } from "@/lib/ml/viz";
import type { MlGroup } from "@/lib/ml/types";
import {
  ORGANIZATION,
  SITE,
  absoluteUrl,
  breadcrumb,
  pageMetadata,
} from "@/lib/site";

const ORDER: MlGroup[] = ["foundation", "supervised", "unsupervised"];
const TITLE = "Machine Learning cơ bản: 11 thuật toán qua mô phỏng";
const DESC =
  "Khoá học 11 thuật toán học máy nền tảng: hồi quy, k-NN, cây quyết định, SVM, mạng nơ-ron, K-Means, PCA… mô phỏng từng bước, code Python chạy thật.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESC,
  path: "/ml",
});

const mainEntity = {
  "@type": "Course",
  "@id": absoluteUrl("/ml#course"),
  name: TITLE,
  description: DESC,
  url: absoluteUrl("/ml"),
  inLanguage: SITE.language,
  isAccessibleForFree: true,
  educationalLevel: "Beginner",
  teaches: "Các thuật toán học máy cơ bản với Python, NumPy và scikit-learn",
  provider: ORGANIZATION,
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: "PT3H",
  },
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "VND",
    category: "Free",
  },
  hasPart: ML_LESSONS.map((l) => ({
    "@type": "LearningResource",
    name: `${l.name} — ${l.viName}`,
    url: absoluteUrl(`/ml/${l.slug}`),
  })),
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    mainEntity,
    breadcrumb([
      { name: SITE.name, path: "/" },
      { name: "Machine Learning", path: "/ml" },
    ]),
  ],
};

export default function MlOverview() {
  return (
    <div className="overview">
      <JsonLd data={structuredData} />
      <section className="card hero">
        <p className="crumb">
          Khoá học 03 · {ML_LESSONS.length} bài · Python (NumPy + scikit-learn)
        </p>
        <h1>
          Học <mark>Machine Learning</mark> bằng mô phỏng
        </h1>
        <p className="subtitle">
          Mỗi thuật toán được cài đặt từ đầu bằng NumPy và đối chiếu với
          scikit-learn. Biểu đồ động cho thấy mô hình thay đổi qua từng bước
          huấn luyện — đường hồi quy xoay dần, tâm cụm di chuyển, vùng quyết
          định đổi màu.
        </p>
        <div className="hero-actions">
          <Link href="/ml/gradient-descent" className="btn btn-green">
            Bắt đầu bài 01 →
          </Link>
          <Link href="/ml/cheatsheet" className="btn">
            Xem cheatsheet
          </Link>
        </div>
      </section>

      {ORDER.map((g, gi) => (
        <section key={g} id={g} className="ov-group">
          <header>
            <span className={`dot cat-${g}`} />
            <h2>
              {String(gi + 1).padStart(2, "0")}. {ML_GROUPS[g].vi}
            </h2>
            <span className="muted">{ML_GROUPS[g].label}</span>
          </header>
          <p className="muted ov-blurb">{ML_GROUPS[g].blurb}</p>
          <ul className="ov-grid">
            {ML_LESSONS.map((l, i) => {
              if (l.group !== g) return null;
              const viz = buildViz(l.slug);
              return (
                <li key={l.slug}>
                  <Link href={`/ml/${l.slug}`} className="ov-card card">
                    <div className="ov-thumb">
                      <Plot
                        id={`th-${l.slug}`}
                        viz={viz}
                        frame={viz.frames[viz.frames.length - 1]}
                        title={`Mô phỏng ${l.name}`}
                        compact
                      />
                    </div>
                    <div className="ov-body">
                      <div className="ov-meta">
                        <span className="num">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="chip chip-violet">{l.task}</span>
                      </div>
                      <h3>{l.name}</h3>
                      <p className="vi">{l.viName}</p>
                      <p className="intent">{l.intent}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
