import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { CATEGORY_INFO } from "@/data/meta";
import { getPattern, PATTERNS } from "@/data/patterns";

const CAT_NUM = { creational: "01", structural: "02", behavioral: "03" } as const;

type Params = PageProps<"/patterns/[slug]">["params"];

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/patterns/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = getPattern(slug);
  if (!found) return {};
  return { title: `${found.pattern.name} — ${found.pattern.viName}`, description: found.pattern.intent };
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

  return (
    <LessonPlayer
      key={pattern.slug}
      pattern={pattern}
      sequence={sequence}
      example={example}
      index={index}
      total={PATTERNS.length}
      categoryLabel={CATEGORY_INFO[pattern.category].vi.replace("Nhóm ", "").replace(/^./, (c) => c.toUpperCase())}
      categoryNum={CAT_NUM[pattern.category]}
      lessonInCategory={{ n: siblings.findIndex((x) => x.slug === slug) + 1, of: siblings.length }}
      prev={prev && { slug: prev.slug, name: prev.name }}
      next={next && { slug: next.slug, name: next.name }}
    />
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
