/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { ArchLesson } from "@/lib/arch/types";
import type { ExampleCode } from "@/lib/types";
import { useLessonController } from "@/lib/useLessonController";
import { useWideStage } from "@/lib/useWideStage";
import { Code, Terminal } from "../Code";
import {
  IconArrowLeft,
  IconExpand,
  IconShrink,
  IconArrowRight,
  IconClock,
  IconLayers,
  IconPause,
  IconPlay,
  IconReplay,
  IconSpark,
  IconSteps,
} from "../Icons";
import { Rich } from "../Rich";
import { ArchDiagram } from "./ArchDiagram";
import { ArchIsometric } from "./ArchIsometric";

type StepKind = "problem" | "structure" | "flow" | "code" | "recap";
interface Step {
  kind: StepKind;
  label: string;
  index?: number;
}

const BADGE: Record<StepKind, [string, string]> = {
  problem: ["VẤN ĐỀ", "badge-rose"],
  structure: ["CẤU TRÚC", "badge-violet"],
  flow: ["LUỒNG CHẠY", "badge-green"],
  code: ["CODE", "badge-orange"],
  recap: ["TỔNG KẾT", "badge-ink"],
};

const HOP_LABEL: Record<string, string> = {
  request: "gọi",
  response: "trả về",
  event: "sự kiện",
  fail: "lỗi",
  compensate: "bù trừ",
};

interface Props {
  lesson: ArchLesson;
  example: ExampleCode;
  groupLabel: string;
  groupNum: string;
  lessonInGroup: { n: number; of: number };
  prev: { slug: string; name: string } | null;
  next: { slug: string; name: string } | null;
}

export function ArchLessonPlayer({
  lesson: l,
  example,
  groupLabel,
  groupNum,
  lessonInGroup,
  prev,
  next,
}: Props) {
  const steps = useMemo<Step[]>(
    () => [
      { kind: "problem", label: "Vấn đề" },
      { kind: "structure", label: "Cấu trúc" },
      ...l.flow.map((s, index) => ({
        kind: "flow" as const,
        label: s.title,
        index,
      })),
      { kind: "code", label: "Code" },
      { kind: "recap", label: "Tổng kết" },
    ],
    [l],
  );
  const labels = useMemo(() => steps.map((s) => s.label), [steps]);
  // Bước luồng chạy giữ lâu hơn khi có nhiều chặng
  const holdMs = useCallback(
    (i: number) =>
      steps[i].kind === "flow"
        ? 1400 + l.flow[steps[i].index!].hops.length * 900
        : 3600,
    [steps, l],
  );
  const {
    step,
    last,
    go,
    playing,
    setPlaying,
    togglePlay,
    playKey,
    reduced,
    announce,
    replay,
  } = useLessonController({
    labels,
    holdMs,
    replayFrom: 2,
    progressKey: `arch:${l.slug}`,
  });
  const { wide, toggle: toggleWide } = useWideStage();

  // Mặc định luôn là 2D khi vào bài; công tắc chỉ đổi chế độ trong lần xem hiện tại
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [lang, setLang] = useState<"ts" | "java">("ts");
  const chooseView = (v: "2d" | "3d") => setView(v);

  const cur = steps[step];
  const flowStep = cur.kind === "flow" ? l.flow[cur.index!] : null;
  const showsDiagram =
    cur.kind === "structure" || cur.kind === "flow" || cur.kind === "recap";
  const [badge, badgeClass] = BADGE[cur.kind];
  const title = `Sơ đồ kiến trúc — ${l.name}`;

  return (
    <div
      className={`lesson${wide ? " wide" : ""}`}
      data-motion-root
      data-motion-mode="step"
      data-step-count={steps.length}
    >
      <section className="lesson-main card">
        <header className="lesson-head">
          <div>
            <p className="crumb">
              {groupNum}. {groupLabel} <span>/</span> Bài {lessonInGroup.n} của{" "}
              {lessonInGroup.of}
            </p>
            <h1>{l.name}</h1>
            <p className="subtitle">
              {l.viName} — {l.intent}
            </p>
          </div>
          <div className="chips">
            <span className="chip chip-orange">
              <IconClock size={12} />
              {Math.max(5, steps.length + 2)} phút
            </span>
            <span className={`chip chip-cat cat-arch-${l.group}`}>
              <IconLayers size={12} />
              {groupLabel}
            </span>
            <span className="chip chip-violet">
              <IconSteps size={12} />
              {steps.length} bước
            </span>
          </div>
        </header>

        <div className="stage">
          <div className="stage-top">
            <div className="stats">
              <div className="stat">
                <span>THÀNH PHẦN</span>
                <b>{l.diagram.nodes.length}</b>
              </div>
              <div className="stat">
                <span>KẾT NỐI</span>
                <b>{l.diagram.edges.length}</b>
              </div>
              <div className="stat">
                <span>BƯỚC CHẠY</span>
                <b>
                  {flowStep
                    ? `${cur.index! + 1}/${l.flow.length}`
                    : l.flow.length}
                </b>
              </div>
            </div>
            {showsDiagram && (
              <div
                className="view-toggle"
                role="radiogroup"
                aria-label="Chế độ xem sơ đồ"
              >
                {(["2d", "3d"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={view === v}
                    className={view === v ? "on" : undefined}
                    onClick={() => chooseView(v)}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn btn-icon"
              aria-pressed={wide}
              aria-label={
                wide
                  ? "Thu nhỏ khung minh hoạ (Esc)"
                  : "Phóng to khung minh hoạ (F)"
              }
              title={wide ? "Thu nhỏ (Esc)" : "Phóng to (F)"}
              onClick={toggleWide}
            >
              {wide ? <IconShrink size={14} /> : <IconExpand size={14} />}
            </button>
            {!reduced && (
              <div className="controls" data-motion-controls>
                <button
                  type="button"
                  className="btn"
                  data-motion-action="replay"
                  onClick={replay}
                >
                  <IconReplay size={13} />
                  Phát lại
                </button>
                <button
                  type="button"
                  className="btn"
                  data-motion-action={playing ? "pause" : "play"}
                  aria-pressed={playing}
                  onClick={togglePlay}
                >
                  {playing ? <IconPause size={13} /> : <IconPlay size={13} />}
                  {playing ? "Tạm dừng" : "Tự chạy"}
                </button>
              </div>
            )}
          </div>

          <div className={`stage-canvas view-${cur.kind}`}>
            {cur.kind === "problem" && (
              <div className="problem-stage">
                <div className="pop-card">
                  <span className="label">VÍ VON</span>
                  <p>{l.analogy}</p>
                </div>
                <div className="pill-row">
                  {l.participants.slice(0, 4).map((x) => (
                    <span key={x.name} className="pill">
                      {x.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {showsDiagram &&
              (view === "3d" ? (
                <ArchIsometric
                  diagram={l.diagram}
                  id={`iso-${l.slug}`}
                  title={title}
                  step={reduced ? null : flowStep}
                  playKey={playKey}
                />
              ) : (
                <div className="diagram-wrap">
                  <ArchDiagram
                    diagram={l.diagram}
                    id={`arch-${l.slug}`}
                    title={title}
                    step={flowStep}
                    playKey={playKey}
                  />
                </div>
              ))}
            {cur.kind === "code" && (
              <div className="code-stage">
                <Code
                  code={lang === "ts" ? example.typescript : example.java}
                  filename={lang === "ts" ? `${l.slug}.ts` : example.javaFile}
                  lang={lang}
                  tabs={
                    <div
                      className="lang-tabs"
                      role="tablist"
                      aria-label="Ngôn ngữ"
                    >
                      {(["ts", "java"] as const).map((x) => (
                        <button
                          key={x}
                          type="button"
                          role="tab"
                          aria-selected={lang === x}
                          className={lang === x ? "on" : undefined}
                          onClick={() => setLang(x)}
                        >
                          {x === "ts" ? "TypeScript" : "Java"}
                        </button>
                      ))}
                    </div>
                  }
                />
                <Terminal
                  command={
                    lang === "ts"
                      ? `node ${l.slug}.ts`
                      : `java ${example.javaFile}`
                  }
                  lines={lang === "ts" ? example.tsOutput : example.javaOutput}
                />
              </div>
            )}
          </div>

          <div className="stage-legend">
            {showsDiagram ? (
              <>
                <span>
                  <i className="lg lg-call" /> đồng bộ
                </span>
                <span>
                  <i className="lg lg-async" /> bất đồng bộ
                </span>
                <span>
                  <i className="pk pk-request" /> gọi
                </span>
                <span>
                  <i className="pk pk-response" /> trả về
                </span>
                <span>
                  <i className="pk pk-event" /> sự kiện
                </span>
                <span>
                  <i className="pk pk-fail" /> lỗi
                </span>
                <span>
                  <i className="pk pk-compensate" /> bù trừ
                </span>
              </>
            ) : cur.kind === "code" ? (
              <span>
                Mô phỏng trong một tiến trình (mạng, đồng hồ giả lập) — output
                là kết quả chạy thật
              </span>
            ) : (
              <span>
                <i className="lg lg-focal" /> thành phần trọng tâm của mẫu
              </span>
            )}
          </div>
        </div>

        <nav className="stepper card-inner" aria-label="Các bước trong bài">
          <div className="stepper-head">
            <span>TRONG BÀI NÀY</span>
            <span className="muted">
              Bước {step + 1} / {steps.length}
            </span>
          </div>
          <ol>
            {steps.map((s, i) => (
              <li
                key={i}
                className={i === step ? "on" : i < step ? "done" : undefined}
              >
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    go(i);
                  }}
                  aria-current={i === step ? "step" : undefined}
                >
                  <span className="num">{i + 1}</span>
                  <span className="lbl">{s.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <aside className="lesson-side">
        <section className="card narrate">
          <div className="narrate-head">
            <span>
              BƯỚC {step + 1} / {steps.length}
            </span>
            <span className={`badge ${badgeClass}`}>{badge}</span>
          </div>
          <div className="narrate-body" key={step}>
            {cur.kind === "problem" && (
              <>
                <h2>Vấn đề</h2>
                <p>
                  <Rich text={l.problem} />
                </p>
                <KeyIdea title="Ý ĐỊNH">{l.intent}</KeyIdea>
              </>
            )}
            {cur.kind === "structure" && (
              <>
                <h2>Giải pháp</h2>
                <p>
                  <Rich text={l.solution} />
                </p>
                <ul className="parts">
                  {l.participants.map((x) => (
                    <li key={x.name}>
                      <code>{x.name}</code>
                      <span>{x.role}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {flowStep && (
              <>
                <h2>{flowStep.title}</h2>
                <p>
                  <Rich text={flowStep.text} />
                </p>
                {flowStep.hops.length > 0 && (
                  <KeyIdea title="CÁC CHẶNG">
                    <ol className="hop-list">
                      {flowStep.hops.map((h, i) => {
                        const e = l.diagram.edges.find((x) => x.id === h.edge)!;
                        const name = (id: string) =>
                          l.diagram.nodes.find((n) => n.id === id)?.label ?? id;
                        const [a, b] = h.reverse
                          ? [e.to, e.from]
                          : [e.from, e.to];
                        return (
                          <li key={i}>
                            <i
                              className={`pk pk-${h.kind}`}
                              aria-label={HOP_LABEL[h.kind]}
                            />
                            <span>
                              {name(a)} → {name(b)}
                            </span>
                            <code>{h.label}</code>
                          </li>
                        );
                      })}
                    </ol>
                  </KeyIdea>
                )}
              </>
            )}
            {cur.kind === "code" && (
              <>
                <h2>Code chạy được</h2>
                <p>
                  Cùng một kịch bản bằng TypeScript và Java. Mạng và đồng hồ
                  được mô phỏng trong một tiến trình nên kết quả luôn giống
                  nhau.
                </p>
                <KeyIdea title="CHẠY THỬ">
                  <code>node {l.slug}.ts</code>
                  <br />
                  <code>java {example.javaFile}</code>
                </KeyIdea>
              </>
            )}
            {cur.kind === "recap" && (
              <>
                <h2>Tổng kết</h2>
                <h3>Ưu điểm</h3>
                <ul className="pc pros">
                  {l.pros.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <h3>Nhược điểm</h3>
                <ul className="pc cons">
                  {l.cons.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                {l.related.length > 0 && (
                  <p className="related">
                    Liên quan:{" "}
                    {l.related.map((r, i) => (
                      <span key={r}>
                        {i > 0 && ", "}
                        <Link href={`/architecture/${r}`}>
                          {r.replace(/-/g, " ")}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="narrate-nav">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={step === 0}
              onClick={() => go(step - 1)}
            >
              <IconArrowLeft size={13} />
              Lùi
            </button>
            {step < last ? (
              <button
                type="button"
                className="btn btn-green"
                onClick={() => {
                  setPlaying(false);
                  go(step + 1);
                }}
              >
                <span className="ellipsis">Tiếp: {steps[step + 1].label}</span>
                <IconArrowRight size={13} />
              </button>
            ) : next ? (
              <Link
                href={`/architecture/${next.slug}`}
                className="btn btn-green"
              >
                <span className="ellipsis">Bài tiếp: {next.name}</span>
                <IconArrowRight size={13} />
              </Link>
            ) : (
              <Link href="/architecture" className="btn btn-green">
                Hoàn thành khoá kiến trúc 🎉
              </Link>
            )}
          </div>
          <p className="kbd-hints">
            <kbd>←</kbd>
            <kbd>→</kbd> bước · <kbd>R</kbd> lại · <kbd>Space</kbd> chạy ·{" "}
            <kbd>F</kbd> phóng to
          </p>
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {reduced
              ? "Hoạt ảnh bị tắt theo cài đặt giảm chuyển động; sơ đồ hiển thị đầy đủ."
              : announce}
          </p>
        </section>

        <section className="card learn">
          <h2>KHI NÀO NÊN DÙNG</h2>
          <ul>
            {l.whenToUse.map((w) => (
              <li key={w} className={step === last ? "checked" : undefined}>
                <span className="box" aria-hidden />
                <span>
                  <Rich text={w} />
                </span>
              </li>
            ))}
          </ul>
          {prev && (
            <p className="prev-link">
              <Link href={`/architecture/${prev.slug}`}>← {prev.name}</Link>
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}

function KeyIdea({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="key-idea">
      <span className="ki-icon">
        <IconSpark size={14} />
      </span>
      <div>
        <span className="ki-title">{title}</span>
        <div className="ki-body">{children}</div>
      </div>
    </div>
  );
}
