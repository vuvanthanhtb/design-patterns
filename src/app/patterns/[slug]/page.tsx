/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { LessonPlayer } from "@/components/LessonPlayer";
import { CATEGORY_INFO } from "@/data/meta";
import { getPattern, PATTERNS } from "@/data/patterns";
import {
  absoluteUrl,
  fitDescription,
  fitTitle,
  ORGANIZATION,
  pageMetadata,
  SITE,
  codeSamples,
} from "@/lib/site";

const CAT_NUM = {
  creational: "01",
  structural: "02",
  behavioral: "03",
} as const;

type Params = PageProps<"/patterns/[slug]">["params"];

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/patterns/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = getPattern(slug);
  if (!found) return { title: "Không tìm thấy", robots: { index: false } };
  const p = found.pattern;
  return pageMetadata({
    // "Tên (tên Việt) · Loại" — rút gọn khi vượt 65 ký tự
    title: fitTitle([
      `${p.name} (${p.viName}) · Design Pattern`,
      `${p.name} · Design Pattern`,
    ]),
    description: fitDescription(
      p.intent,
      "Sơ đồ UML động, ví dụ TypeScript và Java.",
    ),
    path: `/patterns/${slug}`,
    type: "article",
    image: {
      url: `/patterns/${slug}/og.png`,
      alt: `${p.name} (${p.viName}) — mẫu thiết kế GoF · sơ đồ UML động, TypeScript và Java`,
    },
    section: "Design Patterns",
    keywords: [
      p.name,
      p.viName,
      `${p.name} pattern`,
      `${p.name} TypeScript`,
      `${p.name} Java`,
    ],
  });
}

/**
 * `params` là dữ liệu URL: với Cache Components, phần đọc nó phải nằm trong <Suspense>
 * để chuyển trang hiển thị khung bài học ngay lập tức. Các slug đều được prerender
 * qua generateStaticParams nên HTML tĩnh vẫn chứa đầy đủ nội dung bài học.
 */
export default function PatternPage({ params }: PageProps<"/patterns/[slug]">) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: { params: Params }) {
  const { slug } = await params;
  const found = getPattern(slug);
  if (!found) notFound();
  const { pattern, sequence, example, index, prev, next } = found;
  const siblings = PATTERNS.filter((x) => x.category === pattern.category);

  const url = absoluteUrl(`/patterns/${slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      ...codeSamples(url, pattern.name, [
        { language: "TypeScript", runtime: "Node.js 22+", file: `${slug}.ts` },
        { language: "Java", runtime: "Java 21+", file: example.javaFile },
      ]),
      {
        "@type": "LearningResource",
        "@id": `${url}#lesson`,
        name: `${pattern.name} — ${pattern.viName}`,
        description: pattern.intent,
        url,
        image: absoluteUrl(`/patterns/${slug}/og.png`),
        inLanguage: SITE.language,
        learningResourceType: "Lesson",
        educationalLevel: "Intermediate",
        isAccessibleForFree: true,
        teaches: `Mẫu thiết kế ${pattern.name}`,
        about: [
          { "@type": "Thing", name: "Design pattern" },
          { "@type": "Thing", name: pattern.name },
        ],
        author: { "@type": "Person", name: SITE.author },
        provider: ORGANIZATION,
        dateModified: SITE.updated,
        isPartOf: {
          "@type": "Course",
          "@id": absoluteUrl("/patterns#course"),
          name: "Design Patterns — 23 mẫu thiết kế GoF",
        },
        position: index + 1,
        programmingLanguage: ["TypeScript", "Java"],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE.name,
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Design Patterns",
            item: absoluteUrl("/patterns"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: CATEGORY_INFO[pattern.category].vi,
            item: absoluteUrl(`/patterns#${pattern.category}`),
          },
          { "@type": "ListItem", position: 4, name: pattern.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <LessonPlayer
        key={pattern.slug}
        pattern={pattern}
        sequence={sequence}
        example={example}
        index={index}
        total={PATTERNS.length}
        categoryLabel={CATEGORY_INFO[pattern.category].vi
          .replace("Nhóm ", "")
          .replace(/^./, (c) => c.toUpperCase())}
        categoryNum={CAT_NUM[pattern.category]}
        lessonInCategory={{
          n: siblings.findIndex((x) => x.slug === slug) + 1,
          of: siblings.length,
        }}
        prev={prev && { slug: prev.slug, name: prev.name }}
        next={next && { slug: next.slug, name: next.name }}
      />
    </>
  );
}

/** Khung chờ cùng bố cục với LessonPlayer để không bị nhảy layout. */
function LessonSkeleton() {
  return (
    <div className="lesson" aria-busy="true" aria-label="Đang tải bài học">
      <section className="lesson-main card">
        <header className="lesson-head">
          <div>
            <span className="sk sk-line" style={{ width: 160 }} />
            <span className="sk sk-title" />
            <span className="sk sk-line" style={{ width: "70%" }} />
          </div>
        </header>
        <div className="stage">
          <div className="stage-canvas" />
        </div>
        <div className="stepper">
          <span className="sk sk-line" style={{ width: 120 }} />
        </div>
      </section>
      <aside className="lesson-side">
        <section className="card narrate">
          <span className="sk sk-line" style={{ width: 90 }} />
          <span className="sk sk-title" style={{ width: "60%" }} />
          <span className="sk sk-line" />
          <span className="sk sk-line" style={{ width: "85%" }} />
        </section>
      </aside>
    </div>
  );
}
