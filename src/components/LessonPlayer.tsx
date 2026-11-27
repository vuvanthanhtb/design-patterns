"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildLessonSteps, lessonMinutes, type LessonStep } from "@/lib/lesson";
import { markDone } from "@/lib/progress";
import type { ExampleCode, Pattern, Sequence } from "@/lib/types";
import { Code, Terminal } from "./Code";
import {
  IconArrowLeft,
  IconArrowRight,
  IconClock,
  IconLayers,
  IconPause,
  IconPlay,
  IconReplay,
  IconSpark,
  IconSteps,
} from "./Icons";
import { Rich } from "./Rich";
import { SequenceDiagram } from "./SequenceDiagram";
import { UmlDiagram } from "./UmlDiagram";

interface Props {
  pattern: Pattern;
  sequence: Sequence;
  example: ExampleCode;
  index: number;
  total: number;
  categoryLabel: string;
  categoryNum: string;
  lessonInCategory: { n: number; of: number };
  prev: { slug: string; name: string } | null;
  next: { slug: string; name: string } | null;
}

const HOLD_FLOW = 2600;
const HOLD_OTHER = 3600;

const BADGE_CLASS: Record<LessonStep["kind"], string> = {
  problem: "badge-rose",
  structure: "badge-violet",
  flow: "badge-green",
  code: "badge-orange",
  recap: "badge-ink",
};

export function LessonPlayer(props: Props) {
  const { pattern: p, sequence: seq, example, prev, next } = props;
  const steps = useMemo(() => buildLessonSteps(p, seq), [p, seq]);
  const last = steps.length - 1;
  const firstFlow = steps.findIndex((s) => s.kind === "flow");

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [lang, setLang] = useState<"ts" | "java">("ts");
  const [reduced, setReduced] = useState(false);
  const [announce, setAnnounce] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (to: number, fromUser = true) => {
      const target = Math.max(0, Math.min(last, to));
      setStep(target);
      setPlayKey((k) => k + 1);
      if (fromUser)
        setAnnounce(
          `Bước ${target + 1} / ${steps.length}: ${steps[target].label}`,
        );
    },
    [last, steps],
  );

  // Deep-link: ?step=N (1-based) mở thẳng một bước — chỉ nhận số nguyên hợp lệ
  useEffect(() => {
    const open = () => {
      const raw = new URLSearchParams(window.location.search).get("step");
      if (raw && /^\d+$/.test(raw)) {
        const n = Number(raw) - 1;
        if (n >= 0 && n <= last) setStep(n);
      }
    };
    open();
  }, [last]);

  // Đánh dấu hoàn thành khi tới bước cuối
  useEffect(() => {
    if (step === last) markDone(p.slug);
  }, [step, last, p.slug]);

  // Reduced motion: khung tĩnh đầy đủ, ẩn điều khiển phát
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Một chuỗi setTimeout duy nhất cho chế độ tự phát
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!playing || step >= last) return;
    timer.current = setTimeout(
      () => {
        go(step + 1, false);
        // Dừng ngay khi tới bước cuối — không tự lặp lại
        if (step + 1 >= last) setPlaying(false);
      },
      steps[step].kind === "flow" ? HOLD_FLOW : HOLD_OTHER,
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, step, last, steps, go]);

  // Tạm dừng khi tab bị ẩn
  useEffect(() => {
    const onHide = () =>
      document.visibilityState === "hidden" && setPlaying(false);
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  const replay = useCallback(() => {
    go(firstFlow);
    if (!reduced) setPlaying(true);
  }, [firstFlow, go, reduced]);

  // Phím tắt: ← → bước, Home/End, Space phát/dừng, R phát lại
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        go(step + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlaying(false);
        go(step - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(last);
      } else if (e.key === " " && !t.closest("button, a")) {
        e.preventDefault();
        if (!reduced) setPlaying((v) => !v);
      } else if (e.key.toLowerCase() === "r") {
        replay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, last, replay, reduced, step]);

  const cur = steps[step];
  const flowIndex = cur.kind === "flow" ? cur.index : null;
  const relCount = p.diagram.relations.length;

  return (
    <div
      className="lesson"
      data-motion-root
      data-motion-mode="step"
      data-step-count={steps.length}
    >
      {/* ─────────── Cột giữa ─────────── */}
      <section className="lesson-main card">
        <header className="lesson-head">
          <div>
            <p className="crumb">
              {props.categoryNum}. {props.categoryLabel} <span>/</span> Bài{" "}
              {props.lessonInCategory.n} của {props.lessonInCategory.of}
            </p>
            <h1>{p.name}</h1>
            <p className="subtitle">
              {p.viName} — {p.intent}
            </p>
          </div>
          <div className="chips">
            <span className="chip chip-orange">
              <IconClock size={12} />
              {lessonMinutes(steps.length)} phút
            </span>
            <span className={`chip chip-cat cat-${p.category}`}>
              <IconLayers size={12} />
              {props.categoryLabel}
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
              <Stat label="NHÓM" value={props.categoryLabel} />
              <Stat label="LỚP" value={String(p.diagram.classes.length)} />
              <Stat label="QUAN HỆ" value={String(relCount)} />
              <Stat
                label="BƯỚC CHẠY"
                value={
                  flowIndex === null
                    ? `${seq.steps.length}`
                    : `${flowIndex + 1}/${seq.steps.length}`
                }
              />
            </div>
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
                  onClick={() => {
                    if (!playing && step === last) go(firstFlow);
                    setPlaying((v) => !v);
                  }}
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
                  <p>{p.analogy}</p>
                </div>
                <div className="pill-row">
                  {p.participants.slice(0, 4).map((x) => (
                    <span key={x.name} className="pill">
                      {x.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(cur.kind === "structure" || cur.kind === "recap") && (
              <div className="diagram-wrap">
                <UmlDiagram
                  diagram={p.diagram}
                  id={`cls-${p.slug}`}
                  title={`Sơ đồ lớp UML — ${p.name}`}
                />
              </div>
            )}
            {cur.kind === "flow" && (
              <div className="diagram-wrap">
                <SequenceDiagram
                  seq={seq}
                  id={`seq-${p.slug}`}
                  title={`Sơ đồ tuần tự — ${p.name}`}
                  current={reduced ? null : flowIndex}
                  playKey={playKey}
                />
              </div>
            )}
            {cur.kind === "code" && (
              <div className="code-stage">
                <Code
                  code={lang === "ts" ? example.typescript : example.java}
                  filename={lang === "ts" ? `${p.slug}.ts` : example.javaFile}
                  tabs={
                    <div
                      className="lang-tabs"
                      role="tablist"
                      aria-label="Ngôn ngữ"
                    >
                      {(["ts", "java"] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          role="tab"
                          aria-selected={lang === l}
                          className={lang === l ? "on" : undefined}
                          onClick={() => setLang(l)}
                        >
                          {l === "ts" ? "TypeScript" : "Java"}
                        </button>
                      ))}
                    </div>
                  }
                />
                <Terminal
                  command={
                    lang === "ts"
                      ? `node ${p.slug}.ts`
                      : `java ${example.javaFile}`
                  }
                  lines={lang === "ts" ? example.tsOutput : example.javaOutput}
                />
              </div>
            )}
          </div>

          <div className="stage-legend">
            {cur.kind === "flow" ? (
              <>
                <span>
                  <i className="lg lg-call" /> gọi
                </span>
                <span>
                  <i className="lg lg-return" /> trả về
                </span>
                <span>
                  <i className="lg lg-async" /> bất đồng bộ / tạo mới
                </span>
                <span>
                  <i className="lg lg-active" /> đang chạy
                </span>
              </>
            ) : cur.kind === "code" ? (
              <span>
                Output ở trên là kết quả chạy thật, được ghi cứng trong dữ liệu
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

      {/* ─────────── Cột phải ─────────── */}
      <aside className="lesson-side">
        <section className="card narrate">
          <div className="narrate-head">
            <span>
              BƯỚC {step + 1} / {steps.length}
            </span>
            <span className={`badge ${BADGE_CLASS[cur.kind]}`}>
              {cur.badge}
            </span>
          </div>
          <div className="narrate-body" key={step}>
            <Narration step={cur} pattern={p} seq={seq} example={example} />
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
              <Link href={`/patterns/${next.slug}`} className="btn btn-green">
                <span className="ellipsis">Bài tiếp: {next.name}</span>
                <IconArrowRight size={13} />
              </Link>
            ) : (
              <Link href="/" className="btn btn-green">
                Hoàn thành 23 mẫu 🎉
              </Link>
            )}
          </div>
          <p className="kbd-hints">
            <kbd>←</kbd>
            <kbd>→</kbd> bước · <kbd>R</kbd> lại · <kbd>Space</kbd> chạy
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
            {p.whenToUse.map((w) => (
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
              <Link href={`/patterns/${prev.slug}`}>← {prev.name}</Link>
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Narration({
  step,
  pattern: p,
  seq,
  example,
}: {
  step: LessonStep;
  pattern: Pattern;
  seq: Sequence;
  example: ExampleCode;
}) {
  switch (step.kind) {
    case "problem":
      return (
        <>
          <h2>Vấn đề</h2>
          <p>
            <Rich text={p.problem} />
          </p>
          <KeyIdea title="Ý ĐỊNH">{p.intent}</KeyIdea>
        </>
      );
    case "structure":
      return (
        <>
          <h2>Giải pháp</h2>
          <p>
            <Rich text={p.solution} />
          </p>
          <ul className="parts">
            {p.participants.map((x) => (
              <li key={x.name}>
                <code>{x.name}</code>
                <span>{x.role}</span>
              </li>
            ))}
          </ul>
        </>
      );
    case "flow": {
      const s = seq.steps[step.index];
      return (
        <>
          <h2>{s.title}</h2>
          <p>
            <Rich text={s.text} />
          </p>
          <KeyIdea title="THÔNG ĐIỆP">
            <ul className="msgs">
              {s.messages.map((m, i) => (
                <li key={i}>
                  <span className={`mk mk-${m.kind}`} />
                  <span>
                    {label(seq, m.from)} → {label(seq, m.to)}
                  </span>
                  <code>{m.label}</code>
                </li>
              ))}
            </ul>
          </KeyIdea>
        </>
      );
    }
    case "code":
      return (
        <>
          <h2>Code chạy được</h2>
          <p>
            Cùng một kịch bản, viết bằng TypeScript và Java. Chuyển tab ở đầu
            khung code để so sánh.
          </p>
          <KeyIdea title="CHẠY THỬ">
            <code>node {p.slug}.ts</code>
            <br />
            <code>java {example.javaFile}</code>
          </KeyIdea>
        </>
      );
    case "recap":
      return (
        <>
          <h2>Tổng kết</h2>
          <h3>Ưu điểm</h3>
          <ul className="pc pros">
            {p.pros.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <h3>Nhược điểm</h3>
          <ul className="pc cons">
            {p.cons.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {p.related.length > 0 && (
            <p className="related">
              Liên quan:{" "}
              {p.related.map((r, i) => (
                <span key={r}>
                  {i > 0 && ", "}
                  <Link href={`/patterns/${r}`}>{r.replace(/-/g, " ")}</Link>
                </span>
              ))}
            </p>
          )}
        </>
      );
  }
}

const label = (seq: Sequence, id: string) =>
  seq.participants.find((x) => x.id === id)?.label ?? id;

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
