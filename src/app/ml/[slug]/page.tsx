/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { MlLessonPlayer } from "@/components/ml/MlLessonPlayer";
import { getMlLesson, ML_GROUP_NUM, ML_GROUPS, ML_LESSONS } from "@/data/ml";
import { buildViz } from "@/lib/ml/viz";
import { buildViz3D } from "@/lib/ml/viz3d";
import {
  absoluteUrl,
  fitDescription,
  fitTitle,
  ORGANIZATION,
  pageMetadata,
  SITE,
  codeSamples,
} from "@/lib/site";

type Params = PageProps<"/ml/[slug]">["params"];

export function generateStaticParams() {
  return ML_LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/ml/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = getMlLesson(slug);
  if (!found) return { title: "Không tìm thấy", robots: { index: false } };
  const p = found.lesson;
  return pageMetadata({
    // "Tên (tên Việt) · Loại" — rút gọn khi vượt 65 ký tự
    title: fitTitle([
      `${p.name} (${p.viName}) · Machine Learning`,
      `${p.name} · Machine Learning`,
    ]),
    description: fitDescription(
      p.intent,
      "Mô phỏng từng bước và code Python, đối chiếu scikit-learn.",
    ),
    path: `/ml/${slug}`,
    type: "article",
    image: {
      url: `/ml/${slug}/og.png`,
      alt: `${p.name} (${p.viName}) — thuật toán Machine Learning · mô phỏng từng bước, Python`,
    },
    section: "Machine Learning",
    keywords: [
      p.name,
      p.viName,
      `${p.name} Python`,
      `${p.name} scikit-learn`,
      "machine learning",
      "học máy",
    ],
  });
}

/** Đọc params trong <Suspense> (Cache Components); mọi slug được prerender lúc build. */
export default function MlLessonPage({ params }: PageProps<"/ml/[slug]">) {
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
  const found = getMlLesson(slug);
  if (!found) notFound();
  const { lesson, example, index, prev, next } = found;
  const siblings = ML_LESSONS.filter((x) => x.group === lesson.group);
  const url = absoluteUrl(`/ml/${slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      ...codeSamples(url, lesson.name, [
        {
          language: "Python",
          runtime: "Python 3 · NumPy · scikit-learn",
          file: example.file,
        },
      ]),
      {
        "@type": "LearningResource",
        "@id": `${url}#lesson`,
        name: `${lesson.name} — ${lesson.viName}`,
        description: lesson.intent,
        url,
        image: absoluteUrl(`/ml/${slug}/og.png`),
        inLanguage: SITE.language,
        learningResourceType: "Lesson",
        educationalLevel: "Beginner",
        isAccessibleForFree: true,
        teaches: `Thuật toán ${lesson.name}`,
        about: [
          { "@type": "Thing", name: "Machine learning" },
          { "@type": "Thing", name: lesson.name },
        ],
        author: { "@type": "Person", name: SITE.author },
        provider: ORGANIZATION,
        dateModified: SITE.updated,
        isPartOf: {
          "@type": "Course",
          "@id": absoluteUrl("/ml#course"),
          name: "Machine Learning cơ bản",
        },
        position: index + 1,
        programmingLanguage: ["Python"],
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
            name: "Machine Learning",
            item: absoluteUrl("/ml"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: ML_GROUPS[lesson.group].vi,
            item: absoluteUrl(`/ml#${lesson.group}`),
          },
          { "@type": "ListItem", position: 4, name: lesson.name, item: url },
        ],
      },
    ],
  };
  return (
    <>
      <JsonLd data={structuredData} />
      <MlLessonPlayer
        key={lesson.slug}
        lesson={lesson}
        viz={buildViz(slug)}
        viz3d={buildViz3D(slug)}
        example={example}
        groupLabel={ML_GROUPS[lesson.group].vi}
        groupNum={ML_GROUP_NUM[lesson.group]}
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
