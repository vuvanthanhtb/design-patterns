/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { markDone } from "./progress";

interface Options {
  /** Nhãn của từng bước (dùng cho thông báo trình đọc màn hình). */
  labels: string[];
  /** Thời gian dừng ở mỗi bước khi tự chạy (ms). */
  holdMs: (step: number) => number;
  /** Bước bắt đầu khi bấm "Phát lại". */
  replayFrom: number;
  /** Khoá tiến độ — đánh dấu hoàn thành khi tới bước cuối. */
  progressKey: string;
}

/**
 * Điều khiển một bài học nhiều bước: chuyển bước, tự chạy bằng một chuỗi setTimeout
 * duy nhất, phím tắt, tôn trọng prefers-reduced-motion, dừng khi tab ẩn, deep-link ?step=N.
 */
export function useLessonController({
  labels,
  holdMs,
  replayFrom,
  progressKey,
}: Options) {
  const last = labels.length - 1;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [announce, setAnnounce] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (to: number, fromUser = true) => {
      const target = Math.max(0, Math.min(last, to));
      setStep(target);
      setPlayKey((k) => k + 1);
      if (fromUser)
        setAnnounce(`Bước ${target + 1} / ${labels.length}: ${labels[target]}`);
    },
    [last, labels],
  );

  // Deep-link: ?step=N (1-based) mở thẳng một bước — chỉ nhận số nguyên hợp lệ
  useEffect(() => {
    const open = () => {
      const raw = new URLSearchParams(window.location.search).get("step");
      if (raw && /^\d+$/.test(raw)) {
        const n = Number(raw) - 1;
        if (n >= 0 && n <= last) setStep(n);
      }
    };
    open();
  }, [last]);

  // Đánh dấu hoàn thành khi tới bước cuối
  useEffect(() => {
    if (step === last) markDone(progressKey);
  }, [step, last, progressKey]);

  // Reduced motion: khung tĩnh đầy đủ, ẩn điều khiển phát
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Một chuỗi setTimeout duy nhất cho chế độ tự phát
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!playing || step >= last) return;
    timer.current = setTimeout(() => {
      go(step + 1, false);
      // Dừng ngay khi tới bước cuối — không tự lặp lại
      if (step + 1 >= last) setPlaying(false);
    }, holdMs(step));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, step, last, holdMs, go]);

  // Tạm dừng khi tab bị ẩn
  useEffect(() => {
    const onHide = () =>
      document.visibilityState === "hidden" && setPlaying(false);
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  const replay = useCallback(() => {
    go(replayFrom);
    if (!reduced) setPlaying(true);
  }, [replayFrom, go, reduced]);

  const togglePlay = useCallback(() => {
    if (!playing && step === last) go(replayFrom);
    setPlaying((v) => !v);
  }, [playing, step, last, go, replayFrom]);

  // Phím tắt: ← → bước, Home/End, Space phát/dừng, R phát lại
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        go(step + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlaying(false);
        go(step - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(last);
      } else if (e.key === " " && !t.closest("button, a")) {
        e.preventDefault();
        if (!reduced) setPlaying((v) => !v);
      } else if (e.key.toLowerCase() === "r") {
        replay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, last, replay, reduced, step]);

  return {
    step,
    last,
    go,
    playing,
    setPlaying,
    togglePlay,
    playKey,
    reduced,
    announce,
    replay,
  };
}
