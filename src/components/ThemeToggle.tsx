"use client";

import { IconMoon } from "./Icons";

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label="Đổi giao diện sáng/tối"
      title="Đổi giao diện sáng/tối"
      onClick={() => {
        const root = document.documentElement;
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        try {
          localStorage.setItem("theme", next);
        } catch {
          /* storage không khả dụng */
        }
      }}
    >
      <IconMoon />
    </button>
  );
}
