/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Chế độ "phóng to" sân khấu: ẩn sidebar, đưa cột lời giải xuống dưới để hình minh hoạ
 * chiếm toàn bộ chiều rộng (và vì thế cao hơn). Phím F bật/tắt, Esc thoát.
 * Trạng thái đặt trên <html data-stage="wide"> để CSS của layout cùng phản ứng.
 */
export function useWideStage() {
  const [wide, setWide] = useState(false);
  const toggle = useCallback(() => setWide((v) => !v), []);

  useEffect(() => {
    const root = document.documentElement;
    if (wide) root.dataset.stage = "wide";
    else delete root.dataset.stage;
    return () => {
      delete root.dataset.stage;
    };
  }, [wide]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "f") setWide((v) => !v);
      else if (e.key === "Escape") setWide(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { wide, toggle };
}
