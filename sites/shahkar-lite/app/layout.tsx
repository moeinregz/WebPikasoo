import type { Metadata, Viewport } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "باغچه رستوران شاهکار | اسلام‌شهر",
  description:
    "باغچه رستوران شاهکار در اسلام‌شهر — پذیرایی تمام‌وقت از جشن‌ها و میهمانی‌ها، انواع غذاهای ایرانی، موسیقی زنده، حضور هنرمندان و پارکینگ اختصاصی.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0a0907", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
