/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Viz, VizFrame, VizPoint, VizSegment } from "@/lib/ml/types";

/**
 * Biểu đồ toạ độ động. Mỗi phần tử giữ cùng `key` giữa các khung hình nên React
 * tái sử dụng node SVG và CSS transition (transform / fill / opacity) tạo chuyển động:
 * điểm di chuyển, đường thẳng xoay, vùng quyết định đổi màu.
 * Không đo đạc gì lúc runtime — mọi toạ độ đã tính sẵn lúc build.
 */

const VW = 640;
const VH = 440;
const PAD = { l: 52, r: 18, t: 18, b: 46 };

interface Props {
  /** Tiền tố id duy nhất trên trang (clipPath). */
  id: string;
  viz: Viz;
  frame: VizFrame;
  title: string;
  /** Ẩn biểu đồ mất mát nhỏ (ảnh thu nhỏ). */
  compact?: boolean;
}

function niceStep(span: number) {
  const raw = span / 6;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

const deg = (r: number) => (r * 180) / Math.PI;

export function Plot({ id, viz, frame, title, compact = false }: Props) {
  const clip = `${id}-clip`;
  const [x0, x1] = viz.x;
  const [y0, y1] = viz.y;
  const iw = VW - PAD.l - PAD.r;
  const ih = VH - PAD.t - PAD.b;
  const sx = (x: number) => PAD.l + ((x - x0) / (x1 - x0)) * iw;
  const sy = (y: number) => PAD.t + ((y1 - y) / (y1 - y0)) * ih;
  const kx = iw / (x1 - x0);
  const ky = ih / (y1 - y0);

  const xs = niceStep(x1 - x0);
  const ys = niceStep(y1 - y0);
  const ticks = (a: number, b: number, s: number) => {
    const out: number[] = [];
    for (let v = Math.ceil(a / s) * s; v <= b + 1e-9; v += s)
      out.push(Math.round(v * 1e6) / 1e6);
    return out;
  };

  /** Đoạn thẳng vẽ bằng transform để chuyển động mượt trên mọi trình duyệt. */
  const segStyle = (s: VizSegment) => {
    const ax = sx(s.x1);
    const ay = sy(s.y1);
    const len = Math.hypot(sx(s.x2) - ax, sy(s.y2) - ay);
    const ang = deg(Math.atan2(sy(s.y2) - ay, sx(s.x2) - ax));
    return {
      transform: `translate(${ax}px, ${ay}px) rotate(${ang}deg) scaleX(${Math.max(len, 0.001)})`,
    };
  };

  const region = frame.region;
  const cw = region ? iw / region.cols : 0;
  const ch = region ? ih / region.rows : 0;

  return (
    <svg
      className="plot"
      viewBox={`0 0 ${VW} ${VH}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <clipPath id={clip}>
          <rect x={PAD.l} y={PAD.t} width={iw} height={ih} />
        </clipPath>
      </defs>

      {/* Lưới & trục */}
      <g className="grid">
        {ticks(x0, x1, xs).map((v) => (
          <g key={`gx${v}`}>
            <line x1={sx(v)} x2={sx(v)} y1={PAD.t} y2={PAD.t + ih} />
            <text x={sx(v)} y={PAD.t + ih + 16} textAnchor="middle">
              {v}
            </text>
          </g>
        ))}
        {ticks(y0, y1, ys).map((v) => (
          <g key={`gy${v}`}>
            <line x1={PAD.l} x2={PAD.l + iw} y1={sy(v)} y2={sy(v)} />
            <text x={PAD.l - 8} y={sy(v) + 3} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
      </g>
      <rect className="frame" x={PAD.l} y={PAD.t} width={iw} height={ih} />
      <text
        className="axis-label"
        x={PAD.l + iw / 2}
        y={VH - 8}
        textAnchor="middle"
      >
        {viz.xLabel}
      </text>
      <text
        className="axis-label"
        transform={`translate(14 ${PAD.t + ih / 2}) rotate(-90)`}
        textAnchor="middle"
      >
        {viz.yLabel}
      </text>

      <g clipPath={`url(#${clip})`}>
        {/* Vùng quyết định — luôn render đủ ô để màu chuyển mượt giữa các khung */}
        <g className={`region ${region ? "on" : "off"}`}>
          {region &&
            region.values.map((v, i) => {
              const c = i % region.cols;
              const r = Math.floor(i / region.cols);
              const fill =
                region.mode === "class"
                  ? `var(--cls${v})`
                  : `color-mix(in srgb, var(--cls1) ${Math.round(v * 100)}%, var(--cls0))`;
              return (
                <rect
                  key={`cell${region.cols}-${i}`}
                  x={PAD.l + c * cw}
                  y={PAD.t + r * ch}
                  width={cw + 0.5}
                  height={ch + 0.5}
                  style={{ fill }}
                />
              );
            })}
        </g>

        {frame.curve && (
          <polyline
            className="curve"
            points={frame.curve.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")}
          />
        )}

        {(frame.ellipses ?? []).map((e) => (
          <ellipse
            key={e.id}
            className={`ell c${e.cls}`}
            cx={0}
            cy={0}
            rx={1}
            ry={1}
            vectorEffect="non-scaling-stroke"
            style={{
              transform: `translate(${sx(e.cx)}px, ${sy(e.cy)}px) scale(${e.rx * kx}, ${e.ry * ky})`,
            }}
          />
        ))}

        {(frame.circles ?? []).map((c) => (
          <ellipse
            key={c.id}
            className="radius"
            cx={0}
            cy={0}
            rx={1}
            ry={1}
            vectorEffect="non-scaling-stroke"
            style={{
              transform: `translate(${sx(c.cx)}px, ${sy(c.cy)}px) scale(${c.r * kx}, ${c.r * ky})`,
            }}
          />
        ))}

        {(frame.segments ?? []).map((s) => (
          <line
            key={s.id}
            className={`seg seg-${s.kind}`}
            x1={0}
            y1={0}
            x2={1}
            y2={0}
            vectorEffect="non-scaling-stroke"
            style={segStyle(s)}
          />
        ))}

        {(frame.arrows ?? []).map((a) => {
          const st = segStyle({ ...a, kind: "model" });
          const ang = deg(Math.atan2(sy(a.y2) - sy(a.y1), sx(a.x2) - sx(a.x1)));
          return (
            <g key={a.id} className="arrow">
              <line
                x1={0}
                y1={0}
                x2={1}
                y2={0}
                vectorEffect="non-scaling-stroke"
                style={st}
              />
              <path
                d="M0,0 L-10,-5 L-10,5 Z"
                style={{
                  transform: `translate(${sx(a.x2)}px, ${sy(a.y2)}px) rotate(${ang}deg)`,
                }}
              />
              <text
                style={{
                  transform: `translate(${sx(a.x2) + 8}px, ${sy(a.y2) - 8}px)`,
                }}
              >
                {a.label}
              </text>
            </g>
          );
        })}

        {frame.points.map((p) => (
          <Point key={p.id} p={p} x={sx(p.x)} y={sy(p.y)} />
        ))}

        {(frame.centroids ?? []).map((c) => (
          <g
            key={c.id}
            className={`centroid c${c.cls}`}
            style={{ transform: `translate(${sx(c.x)}px, ${sy(c.y)}px)` }}
          >
            <path d="M0,-11 L11,0 L0,11 L-11,0 Z" />
            <path className="x" d="M-4,-4 L4,4 M4,-4 L-4,4" />
          </g>
        ))}
      </g>

      {!compact && frame.series && (
        <Series
          series={frame.series}
          x={viz.seriesAt === "br" ? VW - PAD.r - 170 : PAD.l + 10}
          y={viz.seriesAt === "br" ? PAD.t + ih - 74 : PAD.t + 10}
        />
      )}
    </svg>
  );
}

function Point({ p, x, y }: { p: VizPoint; x: number; y: number }) {
  const kind = p.kind ?? "data";
  const cls = [
    "pt",
    `pt-${kind}`,
    p.cls === undefined ? "c-none" : `c${p.cls}`,
    p.ring ? "ring" : "",
    p.dim ? "dim" : "",
  ].join(" ");
  const r = p.r ?? (kind === "ball" ? 8 : kind === "trail" ? 3.5 : 5);
  return (
    <g className={cls} style={{ transform: `translate(${x}px, ${y}px)` }}>
      {kind === "query" ? (
        <path d="M0,-10 L2.9,-3.1 L10,-3.1 L4.3,1.6 L6.3,9 L0,4.8 L-6.3,9 L-4.3,1.6 L-10,-3.1 L-2.9,-3.1 Z" />
      ) : (
        <>
          {p.ring && <circle className="halo" r={r + 5} />}
          <circle r={r} />
        </>
      )}
    </g>
  );
}

function Series({
  series,
  x,
  y,
}: {
  series: NonNullable<VizFrame["series"]>;
  x: number;
  y: number;
}) {
  const w = 160;
  const h = 64;
  const vals = series.values;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const px = (i: number) =>
    vals.length === 1 ? w / 2 : (i / (vals.length - 1)) * (w - 16) + 8;
  const py = (v: number) =>
    max === min ? h / 2 : 26 + (1 - (v - min) / (max - min)) * (h - 34);
  const shown = vals.slice(0, series.current + 1);
  return (
    <g className="series" transform={`translate(${x} ${y})`} aria-hidden="true">
      <rect width={w} height={h} rx={8} />
      <text x={8} y={14}>
        {series.label}
      </text>
      <polyline
        className="all"
        points={vals.map((v, i) => `${px(i)},${py(v)}`).join(" ")}
      />
      <polyline
        className="done"
        points={shown.map((v, i) => `${px(i)},${py(v)}`).join(" ")}
      />
      <circle cx={px(series.current)} cy={py(vals[series.current])} r={3.5} />
    </g>
  );
}

/** Chú giải lớp/cụm dưới biểu đồ. */
export function PlotLegend({ viz }: { viz: Viz }) {
  if (!viz.classNames.length) return null;
  return (
    <span className="plot-legend">
      {viz.classNames.map((n, i) => (
        <span key={n}>
          <i className={`dot-c c${i}`} /> {n}
        </span>
      ))}
    </span>
  );
}
