/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MlLesson, PythonExample, Viz, Viz3D } from "@/lib/ml/types";
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
import { Plot, PlotLegend } from "./Plot";

// Three.js chỉ tải khi người xem bật chế độ 3D
const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="scene3d scene3d-loading">Đang tải cảnh 3D…</div>
  ),
});

function webglSupported() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

type StepKind = "problem" | "idea" | "sim" | "code" | "recap";
interface Step {
  kind: StepKind;
  label: string;
  frame?: number;
}

const BADGE: Record<StepKind, [string, string]> = {
  problem: ["VẤN ĐỀ", "badge-rose"],
  idea: ["Ý TƯỞNG", "badge-violet"],
  sim: ["MÔ PHỎNG", "badge-green"],
  code: ["PYTHON", "badge-orange"],
  recap: ["TỔNG KẾT", "badge-ink"],
};

interface Props {
  lesson: MlLesson;
  viz: Viz;
  /** Cảnh 3D (null với bài chỉ có 2D). */
  viz3d: Viz3D | null;
  example: PythonExample;
  groupLabel: string;
  groupNum: string;
  lessonInGroup: { n: number; of: number };
  prev: { slug: string; name: string } | null;
  next: { slug: string; name: string } | null;
}

export function MlLessonPlayer({
  lesson: l,
  viz,
  viz3d,
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
      { kind: "idea", label: "Ý tưởng" },
      ...viz.frames.map((fr, i) => ({
        kind: "sim" as const,
        label: fr.title,
        frame: i,
      })),
      { kind: "code", label: "Python" },
      { kind: "recap", label: "Tổng kết" },
    ],
    [viz],
  );
  const labels = useMemo(() => steps.map((s) => s.label), [steps]);
  const firstSim = 2;
  const holdMs = useCallback(
    (i: number) => (steps[i].kind === "sim" ? 2800 : 3800),
    [steps],
  );
  const {
    step,
    last,
    go,
    playing,
    setPlaying,
    togglePlay,
    reduced,
    announce,
    replay,
  } = useLessonController({
    labels,
    holdMs,
    replayFrom: firstSim,
    progressKey: `ml:${l.slug}`,
  });
  const { wide, toggle: toggleWide } = useWideStage();

  // Mặc định luôn là 2D khi vào bài; chỉ kiểm tra WebGL để biết có hiện công tắc 3D
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    const init = () => setWebgl(webglSupported());
    init();
  }, []);
  const chooseView = (v: "2d" | "3d") => setView(v);
  const fallback2d = useCallback(() => {
    setWebgl(false);
    setView("2d");
  }, []);
  const can3d = Boolean(viz3d) && webgl;
  const show3d = can3d && view === "3d";

  const cur = steps[step];
  const frameIdx =
    cur.kind === "sim"
      ? cur.frame!
      : cur.kind === "recap"
        ? viz.frames.length - 1
        : null;
  const frame = frameIdx !== null ? viz.frames[frameIdx] : null;
  const [badge, badgeClass] = BADGE[cur.kind];

  const stats =
    cur.kind === "sim" && frame
      ? (show3d && viz3d?.frames[frameIdx!]?.metrics) || frame.metrics
      : [
          { label: "BÀI TOÁN", value: l.task },
          { label: "NHÓM", value: groupLabel },
          { label: "KHUNG MÔ PHỎNG", value: String(viz.frames.length) },
        ];

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
            <span className={`chip chip-cat cat-${l.group}`}>
              <IconLayers size={12} />
              {l.task}
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
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <span>{s.label.toUpperCase()}</span>
                  <b>{s.value}</b>
                </div>
              ))}
            </div>
            {can3d && (cur.kind === "sim" || cur.kind === "recap") && (
              <div
                className="view-toggle"
                role="radiogroup"
                aria-label="Chế độ xem biểu đồ"
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
                  <span className="pill">{l.task}</span>
                  <span className="pill">
                    {l.sklearn.split(" ")[0].split(".").pop()}
                  </span>
                </div>
              </div>
            )}
            {cur.kind === "idea" && (
              <div className="formula-board">
                {l.formulas.map((f) => (
                  <div key={f.label} className="formula">
                    <span>{f.label}</span>
                    <code>{f.expr}</code>
                  </div>
                ))}
              </div>
            )}
            {frame &&
              (cur.kind === "sim" || cur.kind === "recap") &&
              (show3d && viz3d ? (
                <Scene3D
                  viz={viz3d}
                  frame={frameIdx!}
                  reduced={reduced}
                  title={`${l.name} — ${frame.title}`}
                  onUnsupported={fallback2d}
                />
              ) : (
                <div className="plot-wrap">
                  <Plot
                    id={`plot-${l.slug}`}
                    viz={viz}
                    frame={frame}
                    title={`${l.name} — ${frame.title}`}
                  />
                </div>
              ))}
            {cur.kind === "code" && (
              <div className="code-stage">
                <Code
                  code={example.python}
                  filename={example.file}
                  lang="python"
                />
                <Terminal
                  command={`python ${example.file}`}
                  lines={example.output}
                />
              </div>
            )}
          </div>

          <div className="stage-legend">
            {cur.kind === "sim" || cur.kind === "recap" ? (
              <>
                <PlotLegend viz={viz} />
                <span>
                  <i className="lg lg-active" /> mô hình
                </span>
                <span>
                  <i className="lg-star" aria-hidden>
                    ★
                  </i>{" "}
                  điểm cần dự đoán
                </span>
                <span>◯ viền = điểm đáng chú ý</span>
              </>
            ) : cur.kind === "code" ? (
              <span>
                Output là kết quả chạy thật (NumPy + scikit-learn), được ghi
                cứng trong dữ liệu
              </span>
            ) : (
              <span>
                Dữ liệu minh hoạ nhỏ, ghi cứng — trùng khớp với code Python của
                bài
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
                <KeyIdea title="MỤC TIÊU">{l.intent}</KeyIdea>
              </>
            )}
            {cur.kind === "idea" && (
              <>
                <h2>Ý tưởng</h2>
                <p>
                  <Rich text={l.idea} />
                </p>
                <h3>Siêu tham số</h3>
                <ul className="parts">
                  {l.hyperparams.map((h) => (
                    <li key={h.name}>
                      <code>{h.name}</code>
                      <span>{h.desc}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {cur.kind === "sim" && frame && (
              <>
                <h2>{frame.title}</h2>
                <p>
                  <Rich text={frame.text} />
                </p>
                {show3d && viz3d ? (
                  <KeyIdea title="CÁCH ĐỌC BIỂU ĐỒ 3D">{viz3d.note}</KeyIdea>
                ) : (
                  <KeyIdea title="KHUNG MÔ PHỎNG">
                    Khung {frameIdx! + 1} / {viz.frames.length}. Các số liệu ở
                    đầu sân khấu được tính trên đúng dữ liệu của code Python.
                  </KeyIdea>
                )}
              </>
            )}
            {cur.kind === "code" && (
              <>
                <h2>Cài đặt từ đầu</h2>
                <p>
                  Thuật toán viết bằng NumPy cho thấy rõ từng phép tính, sau đó
                  đối chiếu với scikit-learn để kiểm chứng kết quả.
                </p>
                <KeyIdea title="DÙNG TRONG THỰC TẾ">
                  <code>{l.sklearn}</code>
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
                <p className="related">
                  Độ phức tạp: <code>{l.complexity}</code>
                </p>
                {l.related.length > 0 && (
                  <p className="related">
                    Liên quan:{" "}
                    {l.related.map((r, i) => (
                      <span key={r}>
                        {i > 0 && ", "}
                        <Link href={`/ml/${r}`}>{r.replace(/-/g, " ")}</Link>
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
              <Link href={`/ml/${next.slug}`} className="btn btn-green">
                <span className="ellipsis">Bài tiếp: {next.name}</span>
                <IconArrowRight size={13} />
              </Link>
            ) : (
              <Link href="/ml" className="btn btn-green">
                Hoàn thành khoá ML 🎉
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
              ? "Hoạt ảnh bị tắt theo cài đặt giảm chuyển động; biểu đồ hiển thị đầy đủ."
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
              <Link href={`/ml/${prev.slug}`}>← {prev.name}</Link>
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
