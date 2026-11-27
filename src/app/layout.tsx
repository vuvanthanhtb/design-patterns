import type { Metadata } from "next";
import Link from "next/link";
import { JetBrains_Mono } from "next/font/google";
import { HeaderTabs } from "@/components/HeaderTabs";
import { Logo } from "@/components/Icons";
import { SearchBox } from "@/components/SearchBox";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";
import "./site.css";

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Design Patterns · 23 mẫu GoF",
    template: "%s · Design Patterns",
  },
  description:
    "Học 23 mẫu thiết kế GoF qua sơ đồ UML động, ví dụ TypeScript và Java.",
};

// Áp theme đã lưu trước lần paint đầu tiên để không bị nháy.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" suppressHydrationWarning className={mono.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            <Logo />
            <span>
              Design <mark>Patterns</mark>
            </span>
          </Link>
          <HeaderTabs />
          <div className="topbar-right">
            <SearchBox />
            <ThemeToggle />
            <span className="made-by">
              <small>23 mẫu GoF</small>
              <b>TS · Java</b>
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
