/**
 * Copyright (c) 2026 vuvanthanhtb
 * SPDX-License-Identifier: MIT
 */

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { JetBrains_Mono } from "next/font/google";
import { HeaderTabs } from "@/components/HeaderTabs";
import { Logo } from "@/components/Icons";
import { SearchBox } from "@/components/SearchBox";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OG_BASE, SITE } from "@/lib/site";
import "./globals.css";
import "./site.css";

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE.url}/`),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.author }],
  creator: SITE.author,
  publisher: SITE.author,
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    url: "/",
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  // Giao diện tối là mặc định
  themeColor: "#191714",
  colorScheme: "dark light",
};

// Mặc định là giao diện tối (render sẵn data-theme="dark"); script áp lựa chọn đã lưu
// trước lần paint đầu tiên để không bị nháy.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-theme="dark"
      suppressHydrationWarning
      className={mono.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            <Logo />
            <span>
              Học <mark>trực quan</mark>
            </span>
          </Link>
          <HeaderTabs />
          <div className="topbar-right">
            <SearchBox />
            <ThemeToggle />
            <span className="made-by">
              <small>2 khoá · 34 bài</small>
              <b>TS · Java · Py</b>
            </span>
          </div>
        </header>
        <div className="shell">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
