/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Rich } from "@/components/Rich";
import { CATEGORY_INFO } from "@/data/meta";
import { number, PATTERNS } from "@/data/patterns";
import { absoluteUrl, breadcrumb, pageMetadata, SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Cheatsheet 23 mẫu thiết kế GoF · Học trực quan",
  description:
    "Bảng tra cứu nhanh 23 mẫu thiết kế GoF: ý định của từng mẫu, nhóm (Khởi tạo, Cấu trúc, Hành vi) và tín hiệu nhận biết khi nào nên dùng.",
  path: "/cheatsheet",
});

const mainEntity = {
  "@type": "ItemList",
  name: "23 mẫu thiết kế GoF",
  itemListElement: PATTERNS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    url: absoluteUrl(`/patterns/${p.slug}`),
  })),
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    mainEntity,
    breadcrumb([
      { name: SITE.name, path: "/" },
      { name: "Design Patterns", path: "/patterns" },
      { name: "Cheatsheet", path: "/cheatsheet" },
    ]),
  ],
};

export default function Cheatsheet() {
  return (
    <div className="overview">
      <JsonLd data={structuredData} />
      <section className="card hero hero-sm">
        <p className="crumb">Tra cứu nhanh</p>
        <h1>Cheatsheet 23 mẫu</h1>
        <p className="subtitle">
          Một dòng ý định + tín hiệu nhận biết khi nào nên dùng.
        </p>
      </section>
      <div className="card sheet">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Mẫu</th>
              <th>Nhóm</th>
              <th>Ý định</th>
              <th>Dùng khi</th>
            </tr>
          </thead>
          <tbody>
            {PATTERNS.map((p, i) => (
              <tr key={p.slug}>
                <td className="muted">{number(i)}</td>
                <td>
                  <Link href={`/patterns/${p.slug}`} className="sheet-name">
                    {p.name}
                  </Link>
                  <div className="muted">{p.viName}</div>
                </td>
                <td>
                  <span className={`chip chip-cat cat-${p.category}`}>
                    {CATEGORY_INFO[p.category].label}
                  </span>
                </td>
                <td>{p.intent}</td>
                <td className="muted">
                  <Rich text={p.whenToUse[0]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
