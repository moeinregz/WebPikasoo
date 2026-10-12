import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="font-display text-7xl text-accent">۴۰۴</p>
      <h1 className="font-display text-2xl text-ink">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
      <p className="max-w-[44ch] text-[15px] leading-relaxed text-dim">
        ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه حذف یا جابه‌جا شده باشد.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-black transition hover:-translate-y-0.5"
        >
          بازگشت به صفحه اصلی
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-ink/[0.18] px-6 py-3 text-[14.5px] font-semibold text-ink transition hover:border-accent hover:text-accent"
        >
          تماس با ما
        </Link>
      </div>
    </main>
  );
}
