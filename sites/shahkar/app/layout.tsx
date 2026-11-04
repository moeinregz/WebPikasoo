import type { Metadata, Viewport } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/900.css";
import "@fontsource/aref-ruqaa/700.css";
import "@fontsource/lalezar/400.css";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.fullName} | اسلام‌شهر`,
    template: `%s | ${SITE.fullName}`,
  },
  description:
    "باغچه رستوران شاهکار در اسلام‌شهر — پذیرایی تمام‌وقت از جشن‌ها و میهمانی‌ها، انواع غذاهای ایرانی، موسیقی زنده، حضور هنرمندان و پارکینگ اختصاصی.",
  keywords: [
    "باغچه رستوران شاهکار",
    "باغ رستوران اسلامشهر",
    "رستوران اسلام شهر",
    "تالار و باغ جشن اسلامشهر",
    "موسیقی زنده",
    "فیروز بهرام",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    title: SITE.fullName,
    description: "جشن، موسیقی زنده و طعم اصیل ایرانی زیر نور فانوس‌های باغ.",
    images: ["/images/garden-front.webp"],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0907",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SITE.fullName,
  image: `${SITE.url}/images/garden-front.webp`,
  telephone: "+989353030519",
  servesCuisine: "Persian",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address,
    addressLocality: "اسلام‌شهر",
    addressRegion: "تهران",
    addressCountry: "IR",
  },
  sameAs: [SITE.instagramHref],
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "پارکینگ اختصاصی", value: true },
    { "@type": "LocationFeatureSpecification", name: "موسیقی زنده", value: true },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
