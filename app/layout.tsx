import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn, Lalezar } from "next/font/google";
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

// Every relative URL used in metadata below (OG images, canonical paths,
// the sitemap) is resolved against this. MUST be the real production
// domain — set NEXT_PUBLIC_SITE_URL in Vercel's project env vars once a
// custom domain is attached; falls back to the current deployment URL so
// nothing breaks before that's set up.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "وب پیکاسو — WebPIKASO | تیم توسعه نرم‌افزار",
    // Every page that doesn't set its own title gets this appended —
    // pages that DO set a title (about, blog, portfolio, ...) already
    // include "— وب پیکاسو" themselves, so this template is only used
    // as the fallback shape for anything that only sets a bare string.
    template: "%s — وب پیکاسو",
  },
  description:
    "وب پیکاسو (WebPIKASO)، تیم توسعه‌ی نرم‌افزار؛ طراحی و توسعه پنل‌های مدیریتی، سیستم‌های فاکتوردهی، فروشگاه‌های آنلاین، هوش مصنوعی و سئو.",
  keywords: [
    "طراحی سایت",
    "توسعه نرم‌افزار",
    "طراحی وب اپلیکیشن",
    "سئو سایت",
    "پنل مدیریتی",
    "فروشگاه اینترنتی",
    "وب پیکاسو",
    "WebPIKASO",
  ],
  authors: [{ name: "WebPIKASO" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "وب پیکاسو",
    title: "وب پیکاسو — WebPIKASO | تیم توسعه نرم‌افزار",
    description:
      "طراحی و توسعه پنل‌های مدیریتی، سیستم‌های فاکتوردهی، فروشگاه‌های آنلاین، هوش مصنوعی و سئو.",
    url: "/",
    images: [{ url: "/logo.webp", width: 512, height: 512, alt: "وب پیکاسو" }],
  },
  twitter: {
    card: "summary",
    title: "وب پیکاسو — WebPIKASO",
    description:
      "طراحی و توسعه پنل‌های مدیریتی، سیستم‌های فاکتوردهی، فروشگاه‌های آنلاین، هوش مصنوعی و سئو.",
    images: ["/logo.webp"],
  },
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
      className={`${vazirmatn.variable} ${lalezar.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Organization structured data — lets Google show the logo, social
            links, and contact point in search results / knowledge panel.
            Update sameAs / telephone if these ever change. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "وب پیکاسو",
              alternateName: "WebPIKASO",
              url: siteUrl,
              logo: `${siteUrl}/logo.webp`,
              sameAs: ["https://instagram.com/regzly", "https://t.me/WebPikaso"],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+989965745535",
                contactType: "customer service",
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
