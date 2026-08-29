import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn, Lalezar, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const lalezar = Lalezar({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-lalezar",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "وب پیکاسو — WebPIKASO | تیم توسعه نرم‌افزار",
  description:
    "وب پیکاسو (WebPIKASO)، تیم توسعه‌ی نرم‌افزار؛ طراحی و توسعه پنل‌های مدیریتی، سیستم‌های فاکتوردهی، فروشگاه‌های آنلاین، هوش مصنوعی و سئو.",
  authors: [{ name: "WebPIKASO" }],
};

// Runs before paint so the page never flashes the wrong theme. Default is
// always dark (Vercel/GitHub-style) — light only applies if the user
// explicitly switched to it before (stored in localStorage). We intentionally
// do NOT fall back to the OS/browser color-scheme preference, since the
// site's default must stay dark regardless of system setting.
const themeInitScript = `
(function () {
  try {
    if (localStorage.getItem('webpikaso-theme') !== 'light') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${lalezar.variable} ${jbMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
