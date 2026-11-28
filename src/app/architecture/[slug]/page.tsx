/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArchLessonPlayer } from "@/components/arch/ArchLessonPlayer";
import { JsonLd } from "@/components/JsonLd";
import {
  ARCH_GROUP_NUM,
  ARCH_GROUPS,
  ARCH_LESSONS,
  getArchLesson,
} from "@/data/arch";
import { ARCH_CODE } from "@/data/arch/code";
import {
  absoluteUrl,
  fitDescription,
  fitTitle,
  ORGANIZATION,
  pageMetadata,
  SITE,
  codeSamples,
} from "@/lib/site";

type Params = PageProps<"/architecture/[slug]">["params"];

export function generateStaticParams() {
  return ARCH_LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/architecture/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = getArchLesson(slug);
  if (!found) return { title: "Không tìm thấy", robots: { index: false } };
  const p = found.lesson;
  return pageMetadata({
    // "Tên (tên Việt) · Loại" — rút gọn khi vượt 65 ký tự
    title: fitTitle([
      `${p.name} (${p.viName}) · Mẫu kiến trúc`,
      `${p.name} · Mẫu kiến trúc`,
    ]),
    description: fitDescription(
      p.intent,
      "Sơ đồ luồng dữ liệu động, ví dụ TypeScript và Java.",
    ),
    path: `/architecture/${slug}`,
    type: "article",
    image: {
      url: `/architecture/${slug}/og.png`,
      alt: `${p.name} (${p.viName}) — mẫu kiến trúc phần mềm · sơ đồ luồng dữ liệu, TypeScript và Java`,
    },
    section: "Architecture Patterns",
    keywords: [
      p.name,
      p.viName,
      `${p.name} architecture`,
      `${p.name} TypeScript`,
      `${p.name} Java`,
    ],
  });
}

/** Đọc params trong <Suspense> (Cache Components); mọi slug được prerender lúc build. */
export default function ArchLessonPage({
  params,
}: PageProps<"/architecture/[slug]">) {
  return (
    <Suspense
      fallback={
        <div
          className="lesson"
          aria-busy="true"
          aria-label="Đang tải bài học"
        />
      }
    >
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: { params: Params }) {
  const { slug } = await params;
  const found = getArchLesson(slug);
  if (!found) notFound();
  const { lesson, index, prev, next } = found;
  const siblings = ARCH_LESSONS.filter((x) => x.group === lesson.group);
  const url = absoluteUrl(`/architecture/${slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      ...codeSamples(url, lesson.name, [
        { language: "TypeScript", runtime: "Node.js 22+", file: `${slug}.ts` },
        {
          language: "Java",
          runtime: "Java 21+",
          file: ARCH_CODE[slug].javaFile,
        },
      ]),
      {
        "@type": "LearningResource",
        "@id": `${url}#lesson`,
        name: `${lesson.name} — ${lesson.viName}`,
        description: lesson.intent,
        url,
        image: absoluteUrl(`/architecture/${slug}/og.png`),
        inLanguage: SITE.language,
        learningResourceType: "Lesson",
        educationalLevel: "Intermediate",
        isAccessibleForFree: true,
        teaches: `Mẫu kiến trúc ${lesson.name}`,
        about: [
          { "@type": "Thing", name: "Software architecture" },
          { "@type": "Thing", name: lesson.name },
        ],
        author: { "@type": "Person", name: SITE.author },
        provider: ORGANIZATION,
        dateModified: SITE.updated,
        isPartOf: {
          "@type": "Course",
          "@id": absoluteUrl("/architecture#course"),
          name: "Architecture Patterns — 14 mẫu kiến trúc phần mềm",
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
            name: "Architecture Patterns",
            item: absoluteUrl("/architecture"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: ARCH_GROUPS[lesson.group].vi,
            item: absoluteUrl(`/architecture#${lesson.group}`),
          },
          { "@type": "ListItem", position: 4, name: lesson.name, item: url },
        ],
      },
    ],
  };
  return (
    <>
      <JsonLd data={structuredData} />
      <ArchLessonPlayer
        key={lesson.slug}
        lesson={lesson}
        example={ARCH_CODE[slug]}
        groupLabel={ARCH_GROUPS[lesson.group].vi}
        groupNum={ARCH_GROUP_NUM[lesson.group]}
        lessonInGroup={{
          n: siblings.findIndex((x) => x.slug === slug) + 1,
          of: siblings.length,
        }}
        prev={prev && { slug: prev.slug, name: prev.name }}
        next={next && { slug: next.slug, name: next.name }}
      />
    </>
  );
}
