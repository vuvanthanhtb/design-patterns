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
import { absoluteUrl, OG_BASE, SITE } from "@/lib/site";

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
  const l = found.lesson;
  const title = `${l.name} (${l.viName}) — thuật toán ${l.task.toLowerCase()} trong Machine Learning`;
  const description = `${l.intent} Mô phỏng từng bước và code Python từ đầu, đối chiếu scikit-learn.`;
  const path = `/ml/${slug}`;
  return {
    title,
    description,
    keywords: [
      l.name,
      l.viName,
      `${l.name} Python`,
      `${l.name} scikit-learn`,
      "machine learning",
      "học máy",
      ...SITE.keywords,
    ],
    alternates: { canonical: path },
    openGraph: {
      ...OG_BASE,
      type: "article",
      url: path,
      title,
      description,
      section: "Machine Learning",
      authors: [SITE.author],
    },
    twitter: { card: "summary_large_image", title, description },
  };
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
      {
        "@type": "LearningResource",
        "@id": `${url}#lesson`,
        name: `${lesson.name} — ${lesson.viName}`,
        description: lesson.intent,
        url,
        image: absoluteUrl(`/ml/${slug}/opengraph-image`),
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
