/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

// Tiến độ học lưu trong trình duyệt của từng người xem (tiện ích cá nhân, không gửi đi đâu).
const KEY = "dp-progress";
const EVENT = "dp-progress";

export function readProgress(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function markDone(slug: string) {
  const done = new Set(readProgress());
  if (done.has(slug)) return;
  done.add(slug);
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    /* storage không khả dụng */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeProgress(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
