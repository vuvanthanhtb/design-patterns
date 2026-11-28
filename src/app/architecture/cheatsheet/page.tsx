/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Rich } from "@/components/Rich";
import { ARCH_GROUPS, ARCH_LESSONS } from "@/data/arch";
import { absoluteUrl, breadcrumb, pageMetadata, SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Cheatsheet 14 mẫu kiến trúc phần mềm · Học trực quan",
  description:
    "Bảng tra cứu nhanh 14 mẫu kiến trúc phần mềm: ý định, nhóm, đánh đổi chính và tín hiệu nhận biết khi nào nên dùng từng mẫu.",
  path: "/architecture/cheatsheet",
});

const mainEntity = {
  "@type": "ItemList",
  name: "14 mẫu kiến trúc phần mềm",
  itemListElement: ARCH_LESSONS.map((l, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: l.name,
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
      { name: "Cheatsheet", path: "/architecture/cheatsheet" },
    ]),
  ],
};

export default function ArchCheatsheet() {
  return (
    <div className="overview">
      <JsonLd data={structuredData} />
      <section className="card hero hero-sm">
        <p className="crumb">Tra cứu nhanh · Architecture Patterns</p>
        <h1>Cheatsheet 14 mẫu kiến trúc</h1>
        <p className="subtitle">
          Ý định, đánh đổi chính và tín hiệu nên dùng của từng mẫu.
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
              <th>Đánh đổi chính</th>
              <th>Dùng khi</th>
            </tr>
          </thead>
          <tbody>
            {ARCH_LESSONS.map((l, i) => (
              <tr key={l.slug}>
                <td className="muted">{String(i + 1).padStart(2, "0")}</td>
                <td>
                  <Link href={`/architecture/${l.slug}`} className="sheet-name">
                    {l.name}
                  </Link>
                  <div className="muted">{l.viName}</div>
                </td>
                <td>
                  <span className={`chip chip-cat cat-arch-${l.group}`}>
                    {ARCH_GROUPS[l.group].vi}
                  </span>
                </td>
                <td>{l.intent}</td>
                <td className="muted">{l.cons[0]}</td>
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
