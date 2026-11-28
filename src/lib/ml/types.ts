/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

export type MlGroup = "foundation" | "supervised" | "unsupervised";

export interface PythonExample {
  file: string;
  output: string[];
  python: string;
}

export interface MlLesson {
  slug: string;
  name: string;
  viName: string;
  group: MlGroup;
  /** Loại bài toán: Tối ưu, Hồi quy, Phân loại, Phân cụm, Giảm chiều. */
  task: string;
  intent: string;
  analogy: string;
  problem: string;
  idea: string;
  formulas: { label: string; expr: string }[];
  hyperparams: { name: string; desc: string }[];
  sklearn: string;
  complexity: string;
  whenToUse: string[];
  pros: string[];
  cons: string[];
  related: string[];
}

/* ───────── Biểu đồ động (khung hình tính sẵn lúc build) ───────── */

export interface VizPoint {
  id: string;
  x: number;
  y: number;
  /** Chỉ số lớp/cụm; bỏ trống = điểm chưa gán nhãn. */
  cls?: number;
  /** Viền nổi bật (láng giềng, vector hỗ trợ, điểm phân loại sai…). */
  ring?: boolean;
  dim?: boolean;
  /** "query" = điểm cần dự đoán, "ball" = vị trí tham số trong Gradient Descent. */
  kind?: "data" | "query" | "ball" | "trail";
  r?: number;
}

export type SegKind =
  | "model"
  | "margin"
  | "residual"
  | "distance"
  | "split"
  | "tangent"
  | "axis"
  | "projection"
  | "candidate";

export interface VizSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: SegKind;
}

export interface VizRegion {
  cols: number;
  rows: number;
  /** Giá trị mỗi ô (hàng từ trên xuống): chỉ số lớp hoặc xác suất lớp 1. */
  values: number[];
  mode: "class" | "prob";
}

export interface VizEllipse {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  cls: number;
}

export interface VizCircle {
  id: string;
  cx: number;
  cy: number;
  r: number;
}

export interface VizCentroid {
  id: string;
  x: number;
  y: number;
  cls: number;
}

export interface VizArrow {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

export interface VizFrame {
  title: string;
  text: string;
  points: VizPoint[];
  segments?: VizSegment[];
  region?: VizRegion;
  ellipses?: VizEllipse[];
  circles?: VizCircle[];
  centroids?: VizCentroid[];
  arrows?: VizArrow[];
  /** Đường cong hàm số (Gradient Descent). */
  curve?: [number, number][];
  metrics: { label: string; value: string }[];
  /** Biểu đồ nhỏ góc trên: giá trị mất mát qua các khung. */
  series?: { label: string; values: number[]; current: number };
}

export interface Viz {
  xLabel: string;
  yLabel: string;
  x: [number, number];
  y: [number, number];
  classNames: string[];
  /** Góc đặt biểu đồ mất mát nhỏ — chọn góc không có dữ liệu. */
  seriesAt?: "tl" | "br";
  frames: VizFrame[];
}
