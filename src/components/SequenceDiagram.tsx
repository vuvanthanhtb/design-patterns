/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { SeqMessage, Sequence } from "@/lib/types";

interface Props {
  seq: Sequence;
  id: string;
  title: string;
  /** Bước đang phát (0-based). `null` = khung tĩnh đầy đủ. */
  current: number | null;
  /** Đổi giá trị để phát lại hoạt ảnh của bước hiện tại. */
  playKey?: number;
}

const W = 880;
const HEAD_Y = 16;
const HEAD_H = 36;
const ROW = 44;
const SELF_ROW = 50;
const up4 = (n: number) => Math.ceil(n / 4) * 4;

interface Placed {
  m: SeqMessage;
  step: number;
  order: number; // thứ tự trong bước
  y: number;
  x1: number;
  x2: number;
}

/** Bố cục thuần — toạ độ cố định, không đo đạc lúc runtime. */
export function layoutSequence(seq: Sequence) {
  const n = seq.participants.length;
  const margin = n <= 2 ? 240 : n === 3 ? 150 : 96;
  const xs: Record<string, number> = {};
  seq.participants.forEach((p, i) => {
    xs[p.id] =
      n === 1 ? W / 2 : Math.round(margin + (i * (W - 2 * margin)) / (n - 1));
  });
  const spacing = n > 1 ? (W - 2 * margin) / (n - 1) : W;

  const placed: Placed[] = [];
  const stepY: { top: number; bottom: number }[] = [];
  let y = HEAD_Y + HEAD_H + 40;
  seq.steps.forEach((s, si) => {
    if (seq.fragments?.some((f) => f.fromStep === si)) y += 36;
    const top = y;
    s.messages.forEach((m, mi) => {
      const isSelf = m.from === m.to;
      placed.push({ m, step: si, order: mi, y, x1: xs[m.from], x2: xs[m.to] });
      y += isSelf ? SELF_ROW : ROW;
    });
    stepY.push({ top, bottom: y - (s.messages.length ? 0 : 0) });
    if (seq.fragments?.some((f) => f.toStep === si)) y += 12;
    y += 8;
  });
  return { xs, spacing, placed, stepY, height: up4(y + 8) };
}

export function SequenceDiagram({
  seq,
  id,
  title,
  current,
  playKey = 0,
}: Props) {
  const { xs, spacing, placed, stepY, height } = layoutSequence(seq);
  const m = (s: string) => `${id}-${s}`;
  const activeIds = new Set<string>();
  if (current !== null) {
    for (const msg of seq.steps[current]?.messages ?? []) {
      activeIds.add(msg.from);
      activeIds.add(msg.to);
    }
  }
  const stateOf = (step: number) =>
    current === null
      ? "done"
      : step < current
        ? "done"
        : step === current
          ? "active"
          : "future";

  return (
    <svg
      className="seq"
      viewBox={`0 0 ${W} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <marker
          id={m("filled")}
          markerWidth="9"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L9,4 L0,8 Z" className="mk-filled" />
        </marker>
        <marker
          id={m("filled-ret")}
          markerWidth="9"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L9,4 L0,8 Z" className="mk-filled ret" />
        </marker>
        <marker
          id={m("open")}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L9,4 L0,8" className="mk-open" />
        </marker>
        <marker
          id={m("accent")}
          markerWidth="9"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L9,4 L0,8 Z" className="mk-accent" />
        </marker>
      </defs>

      {/* Combined fragments (loop / opt) — vẽ trước để nằm dưới thông điệp */}
      {(seq.fragments ?? []).map((f, i) => {
        const ids = new Set<string>();
        for (let s = f.fromStep; s <= f.toStep; s++)
          for (const msg of seq.steps[s].messages)
            ids.add(msg.from).add(msg.to);
        const px = [...ids].map((pid) => xs[pid]);
        const x1 = Math.max(32, Math.min(...px) - 56);
        const x2 = Math.min(W - 16, Math.max(...px) + 96);
        const top = stepY[f.fromStep].top - 36;
        const bottom = stepY[f.toStep].bottom - 4;
        return (
          <g key={i}>
            <rect
              x={x1}
              y={top}
              width={x2 - x1}
              height={bottom - top}
              rx={4}
              className="frag-box"
            />
            <path
              d={`M ${x1},${top + 16} V ${top + 4} Q ${x1},${top} ${x1 + 4},${top} H ${x1 + 44} V ${top + 10} L ${x1 + 38},${top + 16} Z`}
              className="frag-tab"
            />
            <text x={x1 + 8} y={top + 11} className="frag-kind">
              {f.kind.toUpperCase()}
            </text>
            <text x={x1 + 52} y={top + 12} className="frag-guard">
              {f.guard}
            </text>
          </g>
        );
      })}

      {/* Participants + lifelines */}
      {seq.participants.map((p) => {
        const x = xs[p.id];
        const w = Math.min(
          up4(p.label.length * 7.3 + 28),
          up4(spacing - 12),
          240,
        );
        return (
          <g
            key={p.id}
            className={`p${p.focal ? " focal" : ""}${activeIds.has(p.id) ? " on" : ""}`}
          >
            <line
              x1={x}
              x2={x}
              y1={HEAD_Y + HEAD_H}
              y2={height - 8}
              className="lifeline"
            />
            <rect
              x={x - w / 2 + 1.5}
              y={HEAD_Y + 2.5}
              width={w}
              height={HEAD_H}
              rx={8}
              className="p-shadow"
            />
            <rect
              x={x - w / 2}
              y={HEAD_Y}
              width={w}
              height={HEAD_H}
              rx={8}
              className="p-box"
            />
            <text x={x} y={HEAD_Y + 22} textAnchor="middle" className="p-label">
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Số bước ở lề trái */}
      {stepY.map((s, i) => (
        <g key={i} className={`step-badge ${stateOf(i)}`}>
          <circle cx={18} cy={s.top} r={9} className="step-dot" />
          <text x={18} y={s.top + 3} textAnchor="middle" className="step-num">
            {i + 1}
          </text>
        </g>
      ))}

      {/* Messages */}
      {placed.map((p, i) => (
        <Message key={i} p={p} state={stateOf(p.step)} m={m} />
      ))}

      {/* Token chạy dọc thông điệp đang phát (trang trí) */}
      {current !== null && (
        <g key={`${current}-${playKey}`} aria-hidden="true">
          {placed
            .filter((p) => p.step === current)
            .map((p, i) =>
              p.x1 === p.x2 ? (
                <circle
                  key={i}
                  cx={p.x1 + (p.x1 + 200 > W ? -20 : 20)}
                  cy={p.y + 10}
                  r={3}
                  className="self-pulse"
                  style={{ animationDelay: `${p.order * 900}ms` }}
                />
              ) : (
                <circle
                  key={i}
                  cx={p.x1}
                  cy={p.y}
                  r={4.5}
                  className="token"
                  style={{
                    ["--dx" as string]: `${p.x2 - p.x1 - Math.sign(p.x2 - p.x1) * 8}px`,
                    animationDelay: `${p.order * 900}ms`,
                  }}
                />
              ),
            )}
        </g>
      )}
    </svg>
  );
}

function Message({
  p,
  state,
  m,
}: {
  p: Placed;
  state: string;
  m: (s: string) => string;
}) {
  const { m: msg, y, x1, x2 } = p;
  const active = state === "active";
  const marker = active
    ? m("accent")
    : msg.kind === "async" || msg.kind === "create"
      ? m("open")
      : msg.kind === "return"
        ? m("filled-ret")
        : m("filled");
  const cls = `msg k-${msg.kind} ${state}`;
  const labelW = up4(msg.label.length * 6.7 + 12);

  if (x1 === x2) {
    // Self-message: vòng chữ U; lật sang trái nếu nhãn sẽ tràn mép phải
    const flip = x1 + 48 + labelW > W - 8;
    const d = flip ? -1 : 1;
    const lx = flip ? x1 - 42 - labelW : x1 + 42;
    return (
      <g className={cls}>
        <path
          d={`M ${x1},${y} H ${x1 + d * 36} V ${y + 22} H ${x1 + d * 4}`}
          className="msg-line"
          markerEnd={`url(#${marker})`}
        />
        <rect
          x={lx}
          y={y + 3}
          width={labelW}
          height={16}
          rx={3}
          className="msg-mask"
        />
        <text x={lx + 6} y={y + 15} className="msg-label">
          {msg.label}
        </text>
      </g>
    );
  }
  const dir = Math.sign(x2 - x1);
  const mid = (x1 + x2) / 2;
  return (
    <g className={cls}>
      <path
        d={`M ${x1 + dir * 2},${y} H ${x2 - dir * 2}`}
        className="msg-line"
        markerEnd={`url(#${marker})`}
      />
      <rect
        x={mid - labelW / 2}
        y={y - 19}
        width={labelW}
        height={16}
        rx={3}
        className="msg-mask"
      />
      <text x={mid} y={y - 8} textAnchor="middle" className="msg-label">
        {msg.label}
      </text>
    </g>
  );
}
