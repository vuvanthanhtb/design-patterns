/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Side } from "@/lib/types";

export type ArchGroup = "app" | "distributed" | "data";

export type ArchNodeKind =
  | "client"
  | "service"
  | "db"
  | "queue"
  | "gateway"
  | "function"
  | "cache"
  | "external"
  | "proxy"
  | "store"
  | "module";

/** Thành phần kiến trúc (hộp trên sơ đồ). */
export interface ArchNode {
  id: string;
  label: string;
  sub?: string;
  kind: ArchNodeKind;
  x: number;
  y: number;
  w?: number;
  h?: number;
  focal?: boolean;
}

/** Vùng / tầng / bounded context bao quanh các thành phần. */
export interface ArchZone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ArchEdgeKind = "sync" | "async" | "data" | "control";

export interface ArchEdge {
  id: string;
  from: string;
  to: string;
  kind: ArchEdgeKind;
  label?: string;
  fromSide?: Side;
  toSide?: Side;
  fromAt?: number;
  toAt?: number;
  via?: number;
  points?: [number, number][];
}

export interface ArchDiagram {
  width: number;
  height: number;
  zones: ArchZone[];
  nodes: ArchNode[];
  edges: ArchEdge[];
}

export type HopKind = "request" | "response" | "event" | "fail" | "compensate";

/** Một "gói tin" chạy dọc một đường nối trong một bước. */
export interface ArchHop {
  edge: string;
  /** Chạy ngược chiều đường nối (phản hồi). */
  reverse?: boolean;
  label: string;
  kind: HopKind;
}

export interface ArchStep {
  title: string;
  text: string;
  hops: ArchHop[];
  /** Huy hiệu trạng thái hiển thị trên thành phần (vd: "OPEN", "v3"). */
  badges?: Record<string, string>;
  /** Thành phần đang sập / offline. */
  down?: string[];
  /** Thành phần chưa tồn tại / đã gỡ bỏ (hiện mờ). */
  ghost?: string[];
}

export interface ArchLesson {
  slug: string;
  name: string;
  viName: string;
  group: ArchGroup;
  intent: string;
  analogy: string;
  problem: string;
  solution: string;
  participants: { name: string; role: string }[];
  whenToUse: string[];
  pros: string[];
  cons: string[];
  related: string[];
  diagram: ArchDiagram;
  flow: ArchStep[];
}
