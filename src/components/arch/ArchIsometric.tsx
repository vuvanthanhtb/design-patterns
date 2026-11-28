/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ArchDiagram as Diagram,
  ArchNodeKind,
  ArchStep,
} from "@/lib/arch/types";
import { ArchDiagram, KindIcon, nodeBox } from "./ArchDiagram";

/**
 * Sa bàn kiến trúc isometric (CSS 3D, không cần WebGL): vùng, đường nối và gói tin
 * nằm trên sàn; mỗi thành phần là một khối nổi. Thành phần tham gia bước hiện tại
 * được nhấc lên.
 */

interface Props {
  diagram: Diagram;
  id: string;
  title: string;
  step?: ArchStep | null;
  playKey?: number;
}

const TILT_X = 52;
const TILT_Z = -32;
const rad = (d: number) => (d * Math.PI) / 180;

const DEPTH: Record<ArchNodeKind, number> = {
  client: 10,
  service: 18,
  db: 30,
  queue: 26,
  gateway: 22,
  function: 16,
  cache: 14,
  external: 12,
  proxy: 20,
  store: 26,
  module: 24,
};

export function ArchIsometric({
  diagram,
  id,
  title,
  step = null,
  playKey = 0,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const W = diagram.width;
  const H = diagram.height;
  const projW = W * Math.cos(rad(-TILT_Z)) + H * Math.sin(rad(-TILT_Z));
  const projH =
    (W * Math.sin(rad(-TILT_Z)) + H * Math.cos(rad(-TILT_Z))) *
      Math.cos(rad(TILT_X)) +
    90;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () =>
      setScale(
        Math.min(
          1.1,
          (el.clientWidth - 24) / projW,
          (el.clientHeight - 24) / projH,
        ),
      );
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => ro.disconnect();
  }, [projW, projH]);

  const active = new Set<string>();
  for (const h of step?.hops ?? []) {
    const e = diagram.edges.find((x) => x.id === h.edge);
    if (e) active.add(e.from).add(e.to);
  }

  return (
    <div
      className="iso iso-arch"
      ref={wrap}
      role="img"
      aria-label={`${title} — sa bàn 3D`}
    >
      <div
        className="iso-board"
        style={{
          width: W,
          height: H,
          transform: `translate(-50%, -50%) scale(${scale}) rotateX(${TILT_X}deg) rotateZ(${TILT_Z}deg)`,
        }}
      >
        <div className="iso-floor">
          <ArchDiagram
            diagram={diagram}
            id={`${id}-floor`}
            title={title}
            step={step}
            playKey={playKey}
            nodes={false}
          />
        </div>
        {diagram.nodes.map((n) => {
          const b = nodeBox(n);
          const depth = n.focal
            ? Math.max(34, DEPTH[n.kind] + 12)
            : DEPTH[n.kind];
          const cls = [
            "iso-block",
            `ak-${n.kind}`,
            n.focal ? "focal" : "",
            active.has(n.id) ? "lit" : "",
            step?.down?.includes(n.id) ? "down" : "",
            step?.ghost?.includes(n.id) ? "ghost" : "",
          ].join(" ");
          const badge = step?.badges?.[n.id];
          return (
            <div
              key={n.id}
              className={cls}
              style={{
                left: b.x,
                top: b.y,
                width: b.w,
                height: b.h,
                ["--d" as string]: `${depth}px`,
              }}
            >
              <div className="iso-shadow" />
              <div className="iso-face iso-n" />
              <div className="iso-face iso-s" />
              <div className="iso-face iso-w" />
              <div className="iso-face iso-e" />
              {badge && <em className="iso-badge">{badge}</em>}
              <div className="iso-top arch-top">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                >
                  <KindIcon kind={n.kind} />
                </svg>
                <span>
                  <b>{n.label}</b>
                  {n.sub && <small>{n.sub}</small>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <span className="scene3d-hint" aria-hidden="true">
        Rê chuột lên khối để nhấc lên
      </span>
    </div>
  );
}
