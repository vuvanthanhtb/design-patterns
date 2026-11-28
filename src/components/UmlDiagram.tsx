/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Diagram, UmlClass, UmlNote, UmlRelation } from "@/lib/types";
import {
  type Box,
  diagramHeight,
  hasStereotype,
  labelPoint,
  measureBox,
  nearEnd,
  roundedPath,
  route,
  textWidth,
} from "@/lib/geometry";

interface Props {
  diagram: Diagram;
  id: string;
  title: string;
  legend?: boolean;
  className?: string;
  /** Làm nổi bật các lớp này, làm mờ phần còn lại. */
  highlight?: string[];
  /** false = chỉ vẽ "sàn" (quan hệ, nhãn, ghi chú) — dùng cho sa bàn 3D. */
  boxes?: boolean;
  /** Cắt viewBox theo nội dung để hình phóng to tối đa (tắt khi làm sàn cho sa bàn 3D). */
  crop?: boolean;
}

const LEGEND_H = 64;

export function UmlDiagram({
  diagram,
  id,
  title,
  legend = true,
  className,
  highlight,
  boxes: drawBoxes = true,
  crop = true,
}: Props) {
  const lit = new Set(highlight ?? []);
  const boxes: Record<string, Box> = {};
  for (const c of diagram.classes) boxes[c.id] = measureBox(c);
  const bodyH = diagramHeight(diagram, boxes);
  const height = bodyH + (legend ? LEGEND_H : 0);
  const m = (name: string) => `${id}-${name}`;

  // Khung nhìn: mặc định cắt sát nội dung (lớp, ghi chú, đường nối) + lề 24px
  let vb = { x: 0, y: 0, w: diagram.width, h: height };
  if (crop) {
    const xs: number[] = [];
    for (const b of Object.values(boxes)) xs.push(b.x, b.x + b.w);
    for (const n of diagram.notes ?? []) xs.push(n.x, n.x + n.w);
    for (const r of diagram.relations)
      for (const [px] of route(r, boxes)) xs.push(px);
    const minLegendW = legend ? 640 : 0;
    let x0 = Math.max(0, Math.min(...xs) - 24);
    let x1 = Math.min(diagram.width, Math.max(...xs) + 24);
    if (x1 - x0 < minLegendW) {
      const pad = (minLegendW - (x1 - x0)) / 2;
      x0 -= pad;
      x1 += pad;
    }
    // Chỉ cắt lề trái/phải: hình bị giới hạn theo chiều rộng nên đó là phần duy nhất
    // làm nội dung to lên; giữ nguyên chiều dọc để khung không bị thấp đi.
    vb = { x: x0, y: 0, w: x1 - x0, h: height };
  }

  return (
    <svg
      className={`uml${lit.size ? " has-dim" : ""} ${className ?? ""}`}
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <Markers m={m} />

      {/* Relationships are drawn before boxes */}
      <g>
        {diagram.relations.map((r, i) => (
          <RelationPath key={i} r={r} boxes={boxes} m={m} />
        ))}
      </g>

      {(diagram.notes ?? []).map((n, i) => (
        <NoteLink key={i} note={n} boxes={boxes} />
      ))}

      <g>
        {drawBoxes &&
          diagram.classes.map((c) => (
            <ClassBox key={c.id} c={c} b={boxes[c.id]} lit={lit.has(c.id)} />
          ))}
      </g>

      {(diagram.notes ?? []).map((n, i) => (
        <Note key={i} note={n} />
      ))}

      {/* Labels last so their paper masks sit above every line */}
      <g>
        {diagram.relations.map((r, i) => (
          <RelationLabels key={i} r={r} boxes={boxes} />
        ))}
      </g>

      {legend && <Legend y={bodyH} x0={vb.x} width={vb.w} m={m} />}
    </svg>
  );
}

function Markers({ m }: { m: (s: string) => string }) {
  return (
    <defs>
      <marker
        id={m("tri")}
        markerWidth="16"
        markerHeight="12"
        refX="15"
        refY="6"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="0 0, 16 6, 0 12" className="mk-hollow" />
      </marker>
      <marker
        id={m("tri-accent")}
        markerWidth="16"
        markerHeight="12"
        refX="15"
        refY="6"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="0 0, 16 6, 0 12" className="mk-hollow accent" />
      </marker>
      <marker
        id={m("dia-filled")}
        markerWidth="18"
        markerHeight="10"
        refX="0"
        refY="5"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="0 5, 9 0, 18 5, 9 10" className="mk-filled" />
      </marker>
      <marker
        id={m("dia-hollow")}
        markerWidth="18"
        markerHeight="10"
        refX="0"
        refY="5"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="0 5, 9 0, 18 5, 9 10" className="mk-hollow" />
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
        id={m("open-accent")}
        markerWidth="10"
        markerHeight="8"
        refX="9"
        refY="4"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path d="M0,0 L9,4 L0,8" className="mk-open accent" />
      </marker>
    </defs>
  );
}

function relStyle(r: UmlRelation, m: (s: string) => string) {
  const acc = r.accent ? "-accent" : "";
  switch (r.kind) {
    case "inherit":
      return { cls: "rel rel-ink", end: m(`tri${acc}`) };
    case "realize":
      return { cls: "rel rel-ink dash-5", end: m(`tri${acc}`) };
    case "compose":
      return { cls: "rel rel-muted", start: m("dia-filled") };
    case "aggregate":
      return { cls: "rel rel-muted", start: m("dia-hollow") };
    case "assoc":
      return { cls: "rel rel-muted", end: m(`open${acc}`) };
    case "depend":
      return { cls: "rel rel-muted dash-4", end: m(`open${acc}`) };
  }
}

function RelationPath({
  r,
  boxes,
  m,
}: {
  r: UmlRelation;
  boxes: Record<string, Box>;
  m: (s: string) => string;
}) {
  const pts = route(r, boxes);
  const s = relStyle(r, m);
  return (
    <path
      d={roundedPath(pts)}
      className={`${s.cls}${r.accent ? " accent" : ""}`}
      markerStart={s.start ? `url(#${s.start})` : undefined}
      markerEnd={s.end ? `url(#${s.end})` : undefined}
    />
  );
}

function MaskedText({
  x,
  y,
  text,
  cls,
}: {
  x: number;
  y: number;
  text: string;
  cls: string;
}) {
  const w = textWidth(text, 8, 0.06);
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 6}
        width={w}
        height={12}
        rx={2}
        className="mask"
      />
      <text x={x} y={y + 3} className={cls} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

function RelationLabels({
  r,
  boxes,
}: {
  r: UmlRelation;
  boxes: Record<string, Box>;
}) {
  if (!r.label && !r.fromMult && !r.toMult) return null;
  const pts = route(r, boxes);
  const out = [];
  if (r.label) {
    const p = labelPoint(pts);
    out.push(
      <MaskedText
        key="l"
        x={p.x}
        y={p.y}
        text={r.label.toUpperCase()}
        cls={`arrow-label${r.accent ? " accent" : ""}`}
      />,
    );
  }
  if (r.fromMult) {
    const [x, y] = nearEnd(
      pts,
      "start",
      r.kind === "compose" || r.kind === "aggregate" ? 30 : 14,
    );
    out.push(<MaskedText key="fm" x={x} y={y} text={r.fromMult} cls="mult" />);
  }
  if (r.toMult) {
    const [x, y] = nearEnd(pts, "end", 22);
    out.push(<MaskedText key="tm" x={x} y={y} text={r.toMult} cls="mult" />);
  }
  return <g>{out}</g>;
}

function ClassBox({ c, b, lit }: { c: UmlClass; b: Box; lit: boolean }) {
  const kind = c.kind ?? "class";
  const cls = [
    "cls",
    `cls-${kind}`,
    c.focal ? "focal" : "",
    lit ? "lit" : "",
  ].join(" ");
  const cx = b.x + b.w / 2;
  const stereo = hasStereotype(c) ? `«${kind}»` : null;
  const ay = b.y + b.nameH;
  const oy = ay + b.attrsH;
  return (
    <g className={cls}>
      <rect
        x={b.x + 1.5}
        y={b.y + 2.5}
        width={b.w}
        height={b.h}
        rx={6}
        className="shadow"
      />
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} className="box" />
      {c.focal && (
        <path
          d={`M ${b.x},${b.y + b.nameH} V ${b.y + 6} Q ${b.x},${b.y} ${b.x + 6},${b.y} H ${b.x + b.w - 6} Q ${b.x + b.w},${b.y} ${b.x + b.w},${b.y + 6} V ${b.y + b.nameH} Z`}
          className="band"
        />
      )}
      {stereo && (
        <text x={cx} y={b.y + 18} textAnchor="middle" className="stereo">
          {stereo}
        </text>
      )}
      <text
        x={cx}
        y={b.y + (stereo ? 36 : 24)}
        textAnchor="middle"
        className={`cname${kind === "abstract" || kind === "interface" ? " italic" : ""}`}
      >
        {c.name}
      </text>
      {kind === "client" && (
        <text x={b.x + 8} y={b.y + 12} className="client-tag">
          CLIENT
        </text>
      )}
      {(b.attrsH > 0 || b.opsH > 0) && (
        <line x1={b.x} x2={b.x + b.w} y1={ay} y2={ay} className="divider" />
      )}
      {(c.attrs ?? []).map((a, i) => (
        <text key={a} x={b.x + 16} y={ay + 24 + i * 20} className="member">
          {a}
        </text>
      ))}
      {b.attrsH > 0 && b.opsH > 0 && (
        <line x1={b.x} x2={b.x + b.w} y1={oy} y2={oy} className="divider" />
      )}
      {(c.ops ?? []).map((o, i) => (
        <text key={o} x={b.x + 16} y={oy + 24 + i * 20} className="member">
          {o}
        </text>
      ))}
    </g>
  );
}

function noteHeight(n: UmlNote) {
  return n.text.length * 16 + 16;
}

function NoteLink({
  note,
  boxes,
}: {
  note: UmlNote;
  boxes: Record<string, Box>;
}) {
  if (!note.attach) return null;
  const b = boxes[note.attach];
  const ncx = note.x + note.w / 2;
  const ncy = note.y + noteHeight(note) / 2;
  const tx = Math.max(b.x, Math.min(ncx, b.x + b.w));
  const ty = Math.max(b.y, Math.min(ncy, b.y + b.h));
  const fx = Math.max(note.x, Math.min(tx, note.x + note.w));
  const fy = Math.max(note.y, Math.min(ty, note.y + noteHeight(note)));
  return <line x1={fx} y1={fy} x2={tx} y2={ty} className="note-link" />;
}

function Note({ note }: { note: UmlNote }) {
  const h = noteHeight(note);
  const { x, y, w } = note;
  return (
    <g className="note">
      <path
        d={`M ${x},${y} H ${x + w - 12} L ${x + w},${y + 12} V ${y + h} H ${x} Z`}
        className="note-box"
      />
      <path
        d={`M ${x + w - 12},${y} V ${y + 12} H ${x + w}`}
        className="note-fold"
      />
      {note.text.map((t, i) => (
        <text key={i} x={x + 12} y={y + 20 + i * 16} className="note-text">
          {t}
        </text>
      ))}
    </g>
  );
}

function Legend({
  y,
  x0 = 0,
  width,
  m,
}: {
  y: number;
  x0?: number;
  width: number;
  m: (s: string) => string;
}) {
  const items: { label: string; cls: string; start?: string; end?: string }[] =
    [
      { label: "Kế thừa", cls: "rel rel-ink", end: m("tri") },
      { label: "Hiện thực", cls: "rel rel-ink dash-5", end: m("tri") },
      {
        label: "Hợp thành · owns",
        cls: "rel rel-muted",
        start: m("dia-filled"),
      },
      { label: "Tập hợp · has", cls: "rel rel-muted", start: m("dia-hollow") },
      { label: "Liên kết", cls: "rel rel-muted", end: m("open") },
      {
        label: "Phụ thuộc · uses",
        cls: "rel rel-muted dash-4",
        end: m("open"),
      },
    ];
  const step = (width - 80) / items.length;
  return (
    <g transform={`translate(${x0} 0)`}>
      <line
        x1={40}
        x2={width - 40}
        y1={y + 4}
        y2={y + 4}
        className="legend-rule"
      />
      <text x={40} y={y + 22} className="legend-title">
        LEGEND · RELATIONSHIPS
      </text>
      {items.map((it, i) => {
        const x = 40 + i * step;
        return (
          <g key={it.label}>
            <path
              d={`M ${x},${y + 40} H ${x + 28}`}
              className={it.cls}
              markerStart={it.start ? `url(#${it.start})` : undefined}
              markerEnd={it.end ? `url(#${it.end})` : undefined}
            />
            <text x={x + 36} y={y + 43} className="legend-text">
              {it.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
