/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Scene3DFrame, Viz3D } from "@/lib/ml/types";

/**
 * Cảnh 3D bằng Three.js (WebGL). Dữ liệu từng khung đã tính sẵn lúc build;
 * component chỉ dựng hình và nội suy mượt giữa hai khung liên tiếp.
 * Không tải khi người xem ở chế độ 2D (được import động).
 */

interface Props {
  viz: Viz3D;
  frame: number;
  reduced: boolean;
  title: string;
  /** Gọi khi trình duyệt không hỗ trợ WebGL — cha sẽ quay về 2D. */
  onUnsupported: () => void;
}

const SIZE = 10; // cạnh sàn trong không gian cảnh
const HEIGHT = 3.6; // chiều cao tối đa của mặt cong
const TWEEN_MS = 750;

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
  "#888";

interface Palette {
  bg: THREE.Color;
  ink: THREE.Color;
  muted: THREE.Color;
  line: THREE.Color;
  cls: THREE.Color[];
  rust: THREE.Color;
  node: THREE.Color;
}

function readPalette(): Palette {
  return {
    bg: new THREE.Color(css("--sheet")),
    ink: new THREE.Color(css("--ink")),
    muted: new THREE.Color(css("--muted")),
    line: new THREE.Color(css("--line-strong")),
    cls: [
      new THREE.Color(css("--cls0")),
      new THREE.Color(css("--cls1")),
      new THREE.Color(css("--cls2")),
    ],
    rust: new THREE.Color(css("--rust")),
    node: new THREE.Color(css("--node")),
  };
}

/** Nhãn chữ dạng sprite (canvas texture). */
function label(text: string, color: string, size = 0.55) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = "600 44px 'JetBrains Mono', ui-monospace, monospace";
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 24;
  c.width = w;
  c.height = 64;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    }),
  );
  sprite.scale.set((w / 64) * size, size, 1);
  return sprite;
}

export default function Scene3D({
  viz,
  frame,
  reduced,
  title,
  onUnsupported,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ show: (f: number) => void } | null>(null);
  const frameRef = useRef(frame);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      onUnsupported();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    let pal = readPalette();
    const scene = new THREE.Scene();
    scene.background = pal.bg;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(11.5, 9.5, 13.5);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, HEIGHT * 0.35, 0);
    controls.enableDamping = true;
    controls.minDistance = 8;
    controls.maxDistance = 34;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.6;
    controls.addEventListener("start", () => (controls.autoRotate = false));

    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(6, 14, 8);
    scene.add(sun);

    /* ── Ánh xạ toạ độ dữ liệu → cảnh ── */
    const [x0, x1] = viz.x;
    const [y0, y1] = viz.y;
    const [z0, z1] = viz.z;
    const sx = (x: number) => ((x - x0) / (x1 - x0) - 0.5) * SIZE;
    const sz = (y: number) => -((y - y0) / (y1 - y0) - 0.5) * SIZE; // y dữ liệu chạy vào trong
    const sy = (z: number) =>
      ((Math.max(z0, Math.min(z1, z)) - z0) / (z1 - z0)) * HEIGHT;

    /* ── Sàn, khung trục, nhãn ── */
    const decor = new THREE.Group();
    scene.add(decor);
    const buildDecor = () => {
      decor.clear();
      const grid = new THREE.GridHelper(SIZE, 10, pal.line, pal.line);
      (grid.material as THREE.Material).transparent = true;
      (grid.material as THREE.Material).opacity = 0.55;
      decor.add(grid);
      const h = SIZE / 2;
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE, HEIGHT, SIZE)),
        new THREE.LineBasicMaterial({
          color: pal.line,
          transparent: true,
          opacity: 0.5,
        }),
      );
      edges.position.y = HEIGHT / 2;
      decor.add(edges);
      const hex = `#${pal.muted.getHexString()}`;
      const lx = label(viz.xLabel, hex);
      lx.position.set(0, -0.2, h + 1.1);
      const ly = label(viz.yLabel, hex);
      ly.position.set(h + 1.4, -0.2, 0);
      const lz = label(viz.zLabel, hex);
      lz.position.set(-h - 0.6, HEIGHT + 0.6, -h);
      const lzMin = label(String(viz.z[0]), hex, 0.42);
      lzMin.position.set(-h - 0.5, 0.05, -h);
      const lzMax = label(String(viz.z[1]), hex, 0.42);
      lzMax.position.set(-h - 0.5, HEIGHT, -h);
      decor.add(lx, ly, lz, lzMin, lzMax);
    };
    buildDecor();

    /* ── Mặt cong ── */
    const { nx, ny } = viz;
    const nv = nx * ny;
    const pos = new Float32Array(nv * 3);
    const col = new Float32Array(nv * 3);
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        pos[k * 3] = sx(x0 + (i / (nx - 1)) * (x1 - x0));
        pos[k * 3 + 2] = sz(y0 + (j / (ny - 1)) * (y1 - y0));
      }
    const idx: number[] = [];
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        const a = j * nx + i;
        idx.push(a, a + 1, a + nx, a + 1, a + nx + 1, a + nx);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setIndex(idx);
    const surfMat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94,
    });
    const surface = new THREE.Mesh(geo, surfMat);
    const wireMat = new THREE.MeshBasicMaterial({
      color: pal.ink,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    const wire = new THREE.Mesh(geo, wireMat);
    scene.add(surface, wire);

    const heightsOf = (f: Scene3DFrame) => {
      const h = new Float32Array(nv);
      for (let k = 0; k < nv; k++) h[k] = f.surface ? sy(f.surface[k]) : 0;
      return h;
    };
    const colorsOf = (f: Scene3DFrame) => {
      const c = new Float32Array(nv * 3);
      const tmp = new THREE.Color();
      for (let k = 0; k < nv; k++) {
        const v = f.surface ? f.surface[k] : z0;
        const t = (Math.max(z0, Math.min(z1, v)) - z0) / (z1 - z0);
        if (!f.surface) tmp.copy(pal.bg).lerp(pal.line, 0.25);
        else if (f.surfaceCls)
          tmp
            .copy(pal.node)
            .lerp(pal.cls[f.surfaceCls[k]], 0.35 + 0.65 * Math.min(1, t * 1.6));
        else if (viz.mode === "class")
          tmp.copy(pal.cls[v >= 0.5 ? 1 : 0]).lerp(pal.node, 0.25);
        else if (viz.mode === "decision")
          tmp
            .copy(pal.node)
            .lerp(
              pal.cls[v >= 0 ? 1 : 0],
              Math.min(1, Math.abs(v) / 2) * 0.85 + 0.1,
            );
        else if (viz.mode === "loss")
          tmp.copy(pal.cls[2]).lerp(pal.cls[1], Math.pow(t, 0.8));
        else tmp.copy(pal.cls[0]).lerp(pal.cls[1], t);
        c[k * 3] = tmp.r;
        c[k * 3 + 1] = tmp.g;
        c[k * 3 + 2] = tmp.b;
      }
      return c;
    };

    /* ── Điểm dữ liệu, quỹ đạo, mặt phẳng ngang ── */
    const pointsGroup = new THREE.Group();
    const extras = new THREE.Group();
    scene.add(pointsGroup, extras);
    const meshes = new Map<
      string,
      {
        obj: THREE.Object3D;
        drop: THREE.Line;
        from: THREE.Vector3;
        to: THREE.Vector3;
      }
    >();
    const sphereGeo = new THREE.SphereGeometry(0.17, 20, 14);
    const ballGeo = new THREE.SphereGeometry(0.32, 28, 18);
    const queryGeo = new THREE.OctahedronGeometry(0.34);
    const ringGeo = new THREE.TorusGeometry(0.32, 0.035, 8, 32);

    const pointMaterial = (cls: number | undefined, kind: string | undefined) =>
      new THREE.MeshLambertMaterial({
        color:
          kind === "ball"
            ? pal.rust
            : kind === "query"
              ? cls === undefined
                ? pal.node
                : pal.cls[cls]
              : cls === undefined
                ? pal.node
                : pal.cls[cls],
      });

    const syncPoints = (f: Scene3DFrame) => {
      const seen = new Set<string>();
      for (const p of f.points) {
        seen.add(p.id);
        const target = new THREE.Vector3(
          sx(p.x),
          sy(p.z) + (p.kind === "ball" ? 0.32 : 0.17),
          sz(p.y),
        );
        let m = meshes.get(p.id);
        if (!m) {
          const obj = new THREE.Group();
          const drop = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(),
              new THREE.Vector3(),
            ]),
            new THREE.LineDashedMaterial({
              color: pal.muted,
              dashSize: 0.12,
              gapSize: 0.1,
              transparent: true,
              opacity: 0.6,
            }),
          );
          pointsGroup.add(obj, drop);
          m = { obj, drop, from: target.clone(), to: target.clone() };
          obj.position.copy(target);
          meshes.set(p.id, m);
        }
        // Dựng lại hình dạng (lớp / loại / viền có thể đổi giữa các khung)
        const obj = m.obj as THREE.Group;
        obj.traverse((o) =>
          (
            (o as THREE.Mesh).material as THREE.Material | undefined
          )?.dispose?.(),
        );
        obj.clear();
        const body = new THREE.Mesh(
          p.kind === "ball"
            ? ballGeo
            : p.kind === "query"
              ? queryGeo
              : sphereGeo,
          pointMaterial(p.cls, p.kind),
        );
        obj.add(body);
        if (p.ring) {
          const ring = new THREE.Mesh(
            ringGeo,
            new THREE.MeshBasicMaterial({ color: pal.ink }),
          );
          ring.rotation.x = Math.PI / 2;
          obj.add(ring);
        }
        m.from = obj.position.clone();
        m.to = target;
      }
      for (const [id, m] of meshes)
        if (!seen.has(id)) {
          pointsGroup.remove(m.obj, m.drop);
          meshes.delete(id);
        }
    };

    const syncExtras = (f: Scene3DFrame) => {
      extras.clear();
      if (f.path && f.path.length > 1) {
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(
            f.path.map(
              ([x, y, z]) => new THREE.Vector3(sx(x), sy(z) + 0.06, sz(y)),
            ),
          ),
          new THREE.LineBasicMaterial({ color: pal.rust }),
        );
        extras.add(line);
        for (const [x, y, z] of f.path.filter((_, i) => i % 3 === 0)) {
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 6),
            new THREE.MeshBasicMaterial({ color: pal.rust }),
          );
          dot.position.set(sx(x), sy(z) + 0.06, sz(y));
          extras.add(dot);
        }
      }
      for (const pl of f.planes ?? []) {
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(SIZE, SIZE),
          new THREE.MeshBasicMaterial({
            color: pal.ink,
            transparent: true,
            opacity: 0.07,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = sy(pl.z);
        const border = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.PlaneGeometry(SIZE, SIZE)),
          new THREE.LineBasicMaterial({
            color: pal.ink,
            transparent: true,
            opacity: 0.35,
          }),
        );
        border.rotation.x = -Math.PI / 2;
        border.position.y = sy(pl.z);
        const tag = label(pl.label, `#${pal.ink.getHexString()}`, 0.42);
        tag.position.set(SIZE / 2 + 0.9, sy(pl.z), -SIZE / 2);
        extras.add(plane, border, tag);
      }
    };

    /* ── Chuyển khung có nội suy ── */
    let fromH = heightsOf(viz.frames[0]);
    let toH = fromH;
    let fromC = colorsOf(viz.frames[0]);
    let toC = fromC;
    let t0 = 0;
    let animating = false;

    const apply = (t: number) => {
      const e = 1 - Math.pow(1 - t, 3);
      for (let k = 0; k < nv; k++) {
        pos[k * 3 + 1] = fromH[k] + (toH[k] - fromH[k]) * e;
        col[k * 3] = fromC[k * 3] + (toC[k * 3] - fromC[k * 3]) * e;
        col[k * 3 + 1] =
          fromC[k * 3 + 1] + (toC[k * 3 + 1] - fromC[k * 3 + 1]) * e;
        col[k * 3 + 2] =
          fromC[k * 3 + 2] + (toC[k * 3 + 2] - fromC[k * 3 + 2]) * e;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.computeVertexNormals();
      for (const m of meshes.values()) {
        m.obj.position.lerpVectors(m.from, m.to, e);
        const p = m.obj.position;
        const g = m.drop.geometry as THREE.BufferGeometry;
        g.setFromPoints([
          new THREE.Vector3(p.x, 0, p.z),
          new THREE.Vector3(p.x, p.y, p.z),
        ]);
        m.drop.computeLineDistances();
      }
    };

    const show = (fi: number) => {
      const f = viz.frames[Math.max(0, Math.min(viz.frames.length - 1, fi))];
      // Bắt đầu từ trạng thái đang hiển thị (kể cả khi đang nội suy dở)
      fromH = new Float32Array(nv);
      for (let k = 0; k < nv; k++) fromH[k] = pos[k * 3 + 1];
      fromC = new Float32Array(col);
      toH = heightsOf(f);
      toC = colorsOf(f);
      syncPoints(f);
      syncExtras(f);
      t0 = performance.now();
      animating = !reduced;
      if (reduced) apply(1);
    };
    api.current = { show };
    show(frameRef.current);
    apply(reduced ? 1 : 0);

    /* ── Kích thước, giao diện sáng/tối, vòng lặp vẽ ── */
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const recolor = () => {
      pal = readPalette();
      scene.background = pal.bg;
      wireMat.color = pal.ink;
      buildDecor();
      show(frameRef.current);
      apply(1);
    };
    const mo = new MutationObserver(recolor);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.visibilityState === "hidden") return;
      if (animating) {
        const t = Math.min(1, (now - t0) / TWEEN_MS);
        apply(t);
        if (t >= 1) animating = false;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
  }, [viz, reduced, onUnsupported]);

  useEffect(() => {
    frameRef.current = frame;
    api.current?.show(frame);
  }, [frame]);

  return (
    <div
      className="scene3d"
      role="img"
      aria-label={`${title} — biểu đồ 3D, kéo để xoay, cuộn để phóng to`}
    >
      <div ref={host} className="scene3d-canvas" />
      <span className="scene3d-hint" aria-hidden="true">
        Kéo để xoay · cuộn để phóng to
      </span>
    </div>
  );
}
