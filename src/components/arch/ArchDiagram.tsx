/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type {
  ArchDiagram as Diagram,
  ArchHop,
  ArchNode,
  ArchNodeKind,
  ArchStep,
} from "@/lib/arch/types";
import { type Box, labelPoint, roundedPath, route } from "@/lib/geometry";
import type { UmlRelation } from "@/lib/types";

/**
 * Sơ đồ kiến trúc: vùng (tầng / bounded context), thành phần và đường nối.
 * Khi có `step`, các "gói tin" chạy dọc đường nối (CSS Motion Path) theo thứ tự,
 * thành phần tham gia được tô sáng, kèm huy hiệu trạng thái.
 */

interface Props {
  diagram: Diagram;
  id: string;
  title: string;
  step?: ArchStep | null;
  /** Đổi để phát lại hoạt ảnh của bước hiện tại. */
  playKey?: number;
  /** false = không vẽ hộp thành phần (dùng làm "sàn" cho sa bàn 3D). */
  nodes?: boolean;
}

type Pt = [number, number];
const HOP_MS = 900;

export const nodeBox = (n: ArchNode): Box => ({
  x: n.x,
  y: n.y,
  w: n.w ?? 150,
  h: n.h ?? 56,
  nameH: 0,
  attrsH: 0,
  opsH: 0,
});

/** Toạ độ đường nối (dùng chung cho bản 2D và sàn của bản 3D). */
export function edgePoints(diagram: Diagram) {
  const boxes: Record<string, Box> = {};
  for (const n of diagram.nodes) boxes[n.id] = nodeBox(n);
  const out: Record<string, Pt[]> = {};
  for (const e of diagram.edges) {
    const a = boxes[e.from];
    const b = boxes[e.to];
    // Sơ đồ kiến trúc chảy từ trái sang phải: hai hộp không chồng nhau theo chiều ngang
    // thì nối cạnh phải ↔ cạnh trái; ngược lại mới nối trên ↔ dưới.
    const apart = a.x + a.w <= b.x || b.x + b.w <= a.x;
    const auto = apart
      ? a.x < b.x
        ? (["right", "left"] as const)
        : (["left", "right"] as const)
      : a.y < b.y
        ? (["bottom", "top"] as const)
        : (["top", "bottom"] as const);
    out[e.id] = route(
      {
        ...e,
        kind: "assoc",
        fromSide: e.fromSide ?? auto[0],
        toSide: e.toSide ?? auto[1],
      } as unknown as UmlRelation,
      boxes,
    );
  }
  return out;
}

const toPath = (pts: Pt[]) => roundedPath(pts);

/** Khung nhìn sát nội dung (vùng, thành phần, đường nối, huy hiệu) + lề 16px. */
function contentBox(diagram: Diagram, pts: Record<string, Pt[]>) {
  // Chỉ cắt lề trái/phải (hình bị giới hạn theo chiều rộng) — giữ nguyên chiều dọc.
  const xs: number[] = [];
  for (const z of diagram.zones) xs.push(z.x, z.x + z.w);
  for (const n of diagram.nodes) {
    const b = nodeBox(n);
    xs.push(b.x, b.x + b.w);
  }
  for (const p of Object.values(pts)) for (const [x] of p) xs.push(x);
  const x0 = Math.max(0, Math.min(...xs) - 16);
  const x1 = Math.min(diagram.width, Math.max(...xs) + 16);
  return `${x0} 0 ${x1 - x0} ${diagram.height}`;
}

export function ArchDiagram({
  diagram,
  id,
  title,
  step = null,
  playKey = 0,
  nodes = true,
}: Props) {
  const pts = edgePoints(diagram);
  const m = (s: string) => `${id}-${s}`;

  const hopEdges = new Map<string, ArchHop>();
  const activeNodes = new Set<string>();
  for (const h of step?.hops ?? []) {
    hopEdges.set(h.edge, h);
    const e = diagram.edges.find((x) => x.id === h.edge)!;
    activeNodes.add(e.from).add(e.to);
  }
  const down = new Set(step?.down ?? []);
  const ghost = new Set(step?.ghost ?? []);

  return (
    <svg
      className="arch"
      viewBox={
        nodes
          ? contentBox(diagram, pts)
          : `0 0 ${diagram.width} ${diagram.height}`
      }
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        {(
          [
            "sync",
            "async",
            "data",
            "control",
            "request",
            "response",
            "event",
            "fail",
            "compensate",
          ] as const
        ).map((k) => (
          <marker
            key={k}
            id={m(k)}
            markerWidth="10"
            markerHeight="8"
            refX="9"
            refY="4"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L9,4 L0,8 Z" className={`am am-${k}`} />
          </marker>
        ))}
      </defs>

      {/* Vùng */}
      {diagram.zones.map((z) => (
        <g key={z.id} className="zone">
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={12} />
          <text x={z.x + 12} y={z.y + 18}>
            {z.label.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Đường nối */}
      {diagram.edges.map((e) => {
        const hop = hopEdges.get(e.id);
        const p = pts[e.id];
        const lp = labelPoint(p);
        return (
          <g
            key={e.id}
            className={`edge edge-${e.kind}${hop ? ` on hop-${hop.kind}` : ""}`}
          >
            <path
              d={toPath(p)}
              markerEnd={`url(#${m(hop ? hop.kind : e.kind)})`}
            />
            {e.label && !hop && (
              <g className="edge-label">
                <rect
                  x={lp.x - e.label.length * 3 - 6}
                  y={lp.y - 8}
                  width={e.label.length * 6 + 12}
                  height={16}
                  rx={4}
                />
                <text x={lp.x} y={lp.y + 3.5} textAnchor="middle">
                  {e.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Thành phần */}
      {nodes &&
        diagram.nodes.map((n) => (
          <NodeBox
            key={n.id}
            n={n}
            on={activeNodes.has(n.id)}
            down={down.has(n.id)}
            ghost={ghost.has(n.id)}
            badge={step?.badges?.[n.id]}
          />
        ))}

      {/* Gói tin + nhãn chặng (vẽ sau cùng để nằm trên) */}
      {step && (
        <g key={`${step.title}-${playKey}`} className="hops">
          {step.hops.map((h, i) => {
            // Nhiều chặng trên cùng một đường nối (gọi rồi trả về): xếp nhãn lệch nhau
            const k = step.hops
              .slice(0, i)
              .filter((x) => x.edge === h.edge).length;
            const p = pts[h.edge];
            const path = toPath(h.reverse ? [...p].reverse() : p);
            const mid = labelPoint(p);
            const lp = { x: mid.x, y: mid.y + k * 24 };
            const w = h.label.length * 6.1 + 16;
            const delay = `${i * HOP_MS}ms`;
            return (
              <g key={i} className={`hop hop-${h.kind}`}>
                <g className="hop-label" style={{ animationDelay: delay }}>
                  <rect
                    x={lp.x - w / 2}
                    y={lp.y - 10}
                    width={w}
                    height={20}
                    rx={10}
                  />
                  <text x={lp.x} y={lp.y + 4} textAnchor="middle">
                    {h.label}
                  </text>
                </g>
                <circle
                  className="packet"
                  r={6}
                  style={{
                    offsetPath: `path("${path}")`,
                    animationDelay: delay,
                  }}
                />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

function NodeBox({
  n,
  on,
  down,
  ghost,
  badge,
}: {
  n: ArchNode;
  on: boolean;
  down: boolean;
  ghost: boolean;
  badge?: string;
}) {
  const b = nodeBox(n);
  const cls = [
    "node",
    `k-${n.kind}`,
    n.focal ? "focal" : "",
    on ? "on" : "",
    down ? "down" : "",
    ghost ? "ghost" : "",
  ].join(" ");
  return (
    <g className={cls}>
      <rect
        className="shadow"
        x={b.x + 1.5}
        y={b.y + 2.5}
        width={b.w}
        height={b.h}
        rx={10}
      />
      <rect className="body" x={b.x} y={b.y} width={b.w} height={b.h} rx={10} />
      <g transform={`translate(${b.x + 12} ${b.y + b.h / 2 - 9})`}>
        <KindIcon kind={n.kind} />
      </g>
      <text className="label" x={b.x + 40} y={b.y + (n.sub ? 24 : 33)}>
        {n.label}
      </text>
      {n.sub && (
        <text className="sub" x={b.x + 40} y={b.y + 40}>
          {n.sub}
        </text>
      )}
      {down && (
        <text
          className="down-tag"
          x={b.x + b.w - 8}
          y={b.y + b.h - 7}
          textAnchor="end"
        >
          ✕ OFFLINE
        </text>
      )}
      {badge && (
        <g className="badge">
          <rect
            x={b.x + b.w - badge.length * 6.2 - 14}
            y={b.y - 11}
            width={badge.length * 6.2 + 16}
            height={20}
            rx={10}
          />
          <text
            x={b.x + b.w - badge.length * 3.1 - 6}
            y={b.y + 3}
            textAnchor="middle"
          >
            {badge}
          </text>
        </g>
      )}
    </g>
  );
}

/** Biểu tượng 18×18 cho từng loại thành phần. */
export function KindIcon({ kind }: { kind: ArchNodeKind }) {
  switch (kind) {
    case "db":
      return (
        <g className="ico">
          <ellipse cx={9} cy={4} rx={8} ry={3} />
          <path d="M1 4 V14 A8 3 0 0 0 17 14 V4" />
          <path d="M1 9 A8 3 0 0 0 17 9" />
        </g>
      );
    case "queue":
      return (
        <g className="ico">
          <rect x={1} y={3} width={16} height={12} rx={2} />
          <path d="M6 3 V15 M11 3 V15" />
        </g>
      );
    case "function":
      return (
        <text className="ico-text" x={9} y={15} textAnchor="middle">
          λ
        </text>
      );
    case "gateway":
      return (
        <g className="ico">
          <path d="M9 1 L17 9 L9 17 L1 9 Z" />
          <path d="M5 9 H13 M10 6 L13 9 L10 12" />
        </g>
      );
    case "client":
      return (
        <g className="ico">
          <rect x={1} y={2} width={16} height={11} rx={2} />
          <path d="M6 17 H12 M9 13 V17" />
        </g>
      );
    case "cache":
      return (
        <g className="ico">
          <path d="M10 1 L3 10 H9 L8 17 L15 8 H9 Z" />
        </g>
      );
    case "external":
      return (
        <g className="ico">
          <path d="M5 14 A4 4 0 0 1 5 6 A5 5 0 0 1 14 5 A4.5 4.5 0 0 1 14 14 Z" />
        </g>
      );
    case "proxy":
      return (
        <g className="ico">
          <path d="M9 1 L16 4 V9 C16 13 13 16 9 17 C5 16 2 13 2 9 V4 Z" />
        </g>
      );
    case "store":
      return (
        <g className="ico">
          <rect x={1} y={2} width={16} height={4} rx={1} />
          <rect x={1} y={7} width={16} height={4} rx={1} />
          <rect x={1} y={12} width={16} height={4} rx={1} />
        </g>
      );
    case "module":
      return (
        <g className="ico">
          <path d="M9 1 L17 5 V13 L9 17 L1 13 V5 Z" />
          <path d="M1 5 L9 9 L17 5 M9 9 V17" />
        </g>
      );
    default:
      return (
        <g className="ico">
          <circle cx={9} cy={9} r={7} />
          <circle cx={9} cy={9} r={2.5} />
        </g>
      );
  }
}
