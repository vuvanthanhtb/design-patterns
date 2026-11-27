/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** Kích thước chuẩn cho Open Graph / Twitter card. */
export const OG_SIZE = { width: 1200, height: 630 };

// Font có đủ dấu tiếng Việt, đọc từ repo lúc build — không cần mạng khi chạy
const fontDir = join(process.cwd(), "src", "assets", "fonts");
const fonts = Promise.all([
  readFile(join(fontDir, "JetBrainsMono-Regular.ttf")),
  readFile(join(fontDir, "JetBrainsMono-ExtraBold.ttf")),
]);

const C = {
  paper: "#f4ebe0",
  sheet: "#f9f2e8",
  ink: "#1d1b18",
  muted: "#6f6961",
  green: "#cfe3b2",
  violet: "#e7ddf5",
  orange: "#fcdcbd",
  line: "#ddd3c5",
  rust: "#d0683a",
};

const CAT_BG: Record<string, string> = {
  creational: C.green,
  structural: C.violet,
  behavioral: C.orange,
};

interface OgProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  chips: { label: string; category?: string }[];
}

/** Ảnh chia sẻ theo đúng ngôn ngữ thiết kế của trang: giấy be, viền đậm, bóng cứng. */
export async function renderOg({ eyebrow, title, subtitle, chips }: OgProps) {
  const [regular, bold] = await fonts;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: C.paper,
        backgroundImage: `linear-gradient(30deg, rgba(80,60,35,.06) 1px, transparent 1px), linear-gradient(150deg, rgba(80,60,35,.06) 1px, transparent 1px)`,
        backgroundSize: "56px 32px",
        fontFamily: "JetBrains Mono",
        color: C.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 30,
          fontWeight: 800,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 48,
            height: 48,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 30,
              height: 22,
              borderRadius: 5,
              border: `3px solid ${C.ink}`,
              background: C.green,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 30,
              height: 22,
              borderRadius: 5,
              border: `3px solid ${C.ink}`,
              background: C.violet,
            }}
          />
        </div>
        Design Patterns
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            fontSize: 22,
            fontWeight: 400,
            color: C.muted,
          }}
        >
          TypeScript · Java
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "44px 48px",
          background: C.sheet,
          border: `4px solid ${C.ink}`,
          borderRadius: 24,
          boxShadow: `8px 12px 0 ${C.ink}`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: C.muted,
            marginBottom: 12,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 18 ? 68 : 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: C.muted,
            marginTop: 18,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {chips.map((c) => (
          <div
            key={c.label}
            style={{
              display: "flex",
              padding: "8px 22px",
              fontSize: 24,
              fontWeight: 800,
              border: `3px solid ${C.ink}`,
              borderRadius: 999,
              background: c.category ? CAT_BG[c.category] : C.sheet,
              boxShadow: `3px 4px 0 ${C.ink}`,
            }}
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "JetBrains Mono", data: regular, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: bold, weight: 800, style: "normal" },
      ],
    },
  );
}
