/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { type Box, diagramHeight, measureBox } from "@/lib/geometry";
import type { Diagram } from "@/lib/types";
import { UmlDiagram } from "./UmlDiagram";

/**
 * Sơ đồ lớp dạng "sa bàn" isometric bằng CSS 3D (không cần WebGL):
 * quan hệ vẽ trên sàn, mỗi lớp là một khối có độ dày đứng trên sàn.
 * Lớp trọng tâm được nâng cao hơn; rê chuột vào khối để nhấc nó lên.
 */

interface Props {
  diagram: Diagram;
  id: string;
  title: string;
}

const TILT_X = 54;
const TILT_Z = -36;
const cosZ = Math.cos((Math.abs(TILT_Z) * Math.PI) / 180);
const sinZ = Math.sin((Math.abs(TILT_Z) * Math.PI) / 180);

export function UmlIsometric({ diagram, id, title }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  const boxes: Record<string, Box> = {};
  for (const c of diagram.classes) boxes[c.id] = measureBox(c);
  const W = diagram.width;
  const H = diagramHeight(diagram, boxes);
  // Kích thước hình chiếu của sàn sau khi xoay — dùng để co vừa khung
  const projW = W * cosZ + H * sinZ;
  const projH = (W * sinZ + H * cosZ) * Math.cos((TILT_X * Math.PI) / 180) + 80;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () =>
      setScale(
        Math.min(
          1.15,
          (el.clientWidth - 24) / projW,
          (el.clientHeight - 24) / projH,
        ),
      );
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => ro.disconnect();
  }, [projW, projH]);

  return (
    <div
      className="iso"
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
          <UmlDiagram
            diagram={diagram}
            id={`${id}-floor`}
            title={title}
            legend={false}
            boxes={false}
            crop={false}
          />
        </div>
        {diagram.classes.map((c) => {
          const b = boxes[c.id];
          const depth = c.focal ? 34 : c.kind === "client" ? 8 : 16;
          const kind = c.kind ?? "class";
          return (
            <div
              key={c.id}
              className={`iso-block iso-${kind}${c.focal ? " focal" : ""}`}
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
              <div className="iso-top">
                {(kind === "interface" || kind === "abstract") && (
                  <span className="iso-stereo">«{kind}»</span>
                )}
                <b
                  className={
                    kind === "interface" || kind === "abstract"
                      ? "italic"
                      : undefined
                  }
                >
                  {c.name}
                </b>
                {Boolean(c.attrs?.length || c.ops?.length) && (
                  <ul>
                    {(c.attrs ?? []).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                    {c.attrs?.length && c.ops?.length ? (
                      <li className="sep" aria-hidden />
                    ) : null}
                    {(c.ops ?? []).map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                )}
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
