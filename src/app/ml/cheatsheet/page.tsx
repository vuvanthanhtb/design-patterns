/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Rich } from "@/components/Rich";
import { ML_GROUPS, ML_LESSONS } from "@/data/ml";
import { absoluteUrl, OG_BASE } from "@/lib/site";

const TITLE = "Cheatsheet 11 thuật toán Machine Learning cơ bản";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Bảng tra cứu nhanh 11 thuật toán học máy cơ bản: loại bài toán, ý tưởng chính, lớp scikit-learn tương ứng, độ phức tạp và khi nào nên dùng.",
  alternates: { canonical: "/ml/cheatsheet" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    url: "/ml/cheatsheet",
    title: TITLE,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "11 thuật toán Machine Learning cơ bản",
  itemListElement: ML_LESSONS.map((l, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: l.name,
    url: absoluteUrl(`/ml/${l.slug}`),
  })),
};

export default function MlCheatsheet() {
  return (
    <div className="overview">
      <JsonLd data={structuredData} />
      <section className="card hero hero-sm">
        <p className="crumb">Tra cứu nhanh · Machine Learning</p>
        <h1>Cheatsheet 11 thuật toán</h1>
        <p className="subtitle">
          Loại bài toán, công thức cốt lõi, lớp scikit-learn tương ứng và tín
          hiệu nên dùng.
        </p>
      </section>
      <div className="card sheet">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Thuật toán</th>
              <th>Bài toán</th>
              <th>Công thức cốt lõi</th>
              <th>scikit-learn</th>
              <th>Dùng khi</th>
            </tr>
          </thead>
          <tbody>
            {ML_LESSONS.map((l, i) => (
              <tr key={l.slug}>
                <td className="muted">{String(i + 1).padStart(2, "0")}</td>
                <td>
                  <Link href={`/ml/${l.slug}`} className="sheet-name">
                    {l.name}
                  </Link>
                  <div className="muted">{l.viName}</div>
                </td>
                <td>
                  <span className={`chip chip-cat cat-${l.group}`}>
                    {l.task}
                  </span>
                  <div className="muted sheet-sub">{ML_GROUPS[l.group].vi}</div>
                </td>
                <td>
                  <code className="sheet-formula">{l.formulas[0].expr}</code>
                </td>
                <td>
                  <code>{l.sklearn.split(" ")[0]}</code>
                </td>
                <td className="muted">
                  <Rich text={l.whenToUse[0]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
