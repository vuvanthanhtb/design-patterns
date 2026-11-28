/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type {
  ArchEdge,
  ArchEdgeKind,
  ArchHop,
  ArchNode,
  ArchNodeKind,
} from "@/lib/arch/types";

/** Thành phần: mặc định 150 × 56. */
export const N = (
  id: string,
  label: string,
  kind: ArchNodeKind,
  x: number,
  y: number,
  o: Partial<ArchNode> = {},
): ArchNode => ({
  id,
  label,
  kind,
  x,
  y,
  ...o,
});

export const E = (
  id: string,
  from: string,
  to: string,
  kind: ArchEdgeKind = "sync",
  o: Partial<ArchEdge> = {},
): ArchEdge => ({
  id,
  from,
  to,
  kind,
  ...o,
});

// Các loại chặng
export const req = (edge: string, label: string): ArchHop => ({
  edge,
  label,
  kind: "request",
});
export const res = (edge: string, label: string): ArchHop => ({
  edge,
  label,
  kind: "response",
  reverse: true,
});
export const ev = (edge: string, label: string): ArchHop => ({
  edge,
  label,
  kind: "event",
});
export const fail = (
  edge: string,
  label: string,
  reverse = false,
): ArchHop => ({ edge, label, kind: "fail", reverse });
export const comp = (edge: string, label: string): ArchHop => ({
  edge,
  label,
  kind: "compensate",
});
