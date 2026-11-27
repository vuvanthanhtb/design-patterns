/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Diagram, Side, UmlClass, UmlRelation } from "./types";

export const NAME_H = 40;
export const NAME_H_STEREO = 48;
export const LINE_H = 20;

const up4 = (n: number) => Math.ceil(n / 4) * 4;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  nameH: number;
  attrsH: number;
  opsH: number;
}

export function hasStereotype(c: UmlClass) {
  return c.kind === "interface" || c.kind === "abstract";
}

/** Text widths follow the diagram-design budget: sans 0.60em, mono 0.62em. */
export function measureBox(c: UmlClass): Box {
  const nameH = hasStereotype(c) ? NAME_H_STEREO : NAME_H;
  const attrsH = c.attrs?.length ? c.attrs.length * LINE_H + LINE_H : 0;
  const opsH = c.ops?.length ? c.ops.length * LINE_H + LINE_H : 0;
  const longest = Math.max(
    0,
    ...(c.attrs ?? []).map((s) => s.length),
    ...(c.ops ?? []).map((s) => s.length),
  );
  const auto = up4(
    Math.max(c.name.length * 12 * 0.6 + 40, longest * 9 * 0.62 + 32, 128),
  );
  return {
    x: c.x,
    y: c.y,
    w: c.w ?? auto,
    h: nameH + attrsH + opsH,
    nameH,
    attrsH,
    opsH,
  };
}

type Pt = [number, number];

function anchor(b: Box, side: Side, at?: number): Pt {
  switch (side) {
    case "top":
      return [at ?? b.x + b.w / 2, b.y];
    case "bottom":
      return [at ?? b.x + b.w / 2, b.y + b.h];
    case "left":
      return [b.x, at ?? b.y + b.h / 2];
    case "right":
      return [b.x + b.w, at ?? b.y + b.h / 2];
  }
}

function autoSides(a: Box, b: Box): [Side, Side] {
  if (a.y >= b.y + b.h) return ["top", "bottom"];
  if (a.y + a.h <= b.y) return ["bottom", "top"];
  if (a.x >= b.x + b.w) return ["left", "right"];
  return ["right", "left"];
}

const vertical = (s: Side) => s === "top" || s === "bottom";

export function route(r: UmlRelation, boxes: Record<string, Box>): Pt[] {
  const a = boxes[r.from];
  const b = boxes[r.to];
  if (!a || !b)
    throw new Error(`Unknown class in relation ${r.from} → ${r.to}`);
  const [sa, sb] = autoSides(a, b);
  const fs = r.fromSide ?? sa;
  const ts = r.toSide ?? sb;
  const p1 = anchor(a, fs, r.fromAt);
  const p2 = anchor(b, ts, r.toAt);
  if (r.points) return [p1, ...r.points, p2];

  if (vertical(fs) && vertical(ts)) {
    if (p1[0] === p2[0]) return [p1, p2];
    const my = r.via ?? (p1[1] + p2[1]) / 2;
    return [p1, [p1[0], my], [p2[0], my], p2];
  }
  if (!vertical(fs) && !vertical(ts)) {
    if (p1[1] === p2[1]) return [p1, p2];
    const mx = r.via ?? (p1[0] + p2[0]) / 2;
    return [p1, [mx, p1[1]], [mx, p2[1]], p2];
  }
  // one elbow
  return vertical(fs) ? [p1, [p1[0], p2[1]], p2] : [p1, [p2[0], p1[1]], p2];
}

/** Orthogonal polyline with rounded (r=8) elbows. */
export function roundedPath(pts: Pt[], r = 8): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py);
    const l2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = cx - ((cx - px) / (l1 || 1)) * rr;
    const ay = cy - ((cy - py) / (l1 || 1)) * rr;
    const bx = cx + ((nx - cx) / (l2 || 1)) * rr;
    const by = cy + ((ny - cy) / (l2 || 1)) * rr;
    d += ` L ${ax},${ay} Q ${cx},${cy} ${bx},${by}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]},${last[1]}`;
  return d;
}

/** Midpoint of the longest segment — where an arrow label sits. */
export function labelPoint(pts: Pt[]): {
  x: number;
  y: number;
  horizontal: boolean;
} {
  let best = 0;
  let bi = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    if (l > best) {
      best = l;
      bi = i;
    }
  }
  const [x1, y1] = pts[bi];
  const [x2, y2] = pts[bi + 1];
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2, horizontal: y1 === y2 };
}

/** Point `d` px from an endpoint, along the first/last segment. */
export function nearEnd(pts: Pt[], end: "start" | "end", d: number): Pt {
  const [a, b] =
    end === "start"
      ? [pts[0], pts[1]]
      : [pts[pts.length - 1], pts[pts.length - 2]];
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [a[0] + ((b[0] - a[0]) / l) * d, a[1] + ((b[1] - a[1]) / l) * d];
}

export function diagramHeight(d: Diagram, boxes: Record<string, Box>) {
  let max = 0;
  for (const b of Object.values(boxes)) max = Math.max(max, b.y + b.h);
  for (const n of d.notes ?? [])
    max = Math.max(max, n.y + n.text.length * 16 + 16);
  for (const r of d.relations)
    for (const p of r.points ?? []) max = Math.max(max, p[1]);
  return up4(max + 40);
}

export const textWidth = (s: string, size: number, tracking = 0) =>
  up4(s.length * size * (0.62 + tracking) + 12);
