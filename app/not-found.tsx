import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <span aria-hidden="true" className="text-h1">
        🍯
      </span>
      <p className="text-h1 text-brand-red">۴۰۴</p>
      <h1 className="text-h2 text-text-primary">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
      <p className="max-w-[44ch] text-body text-text-secondary">
        ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه حذف یا جابه‌جا شده باشد.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="primary">بازگشت به صفحه اصلی</Button>
        </Link>
        <Link href="/shop">
          <Button variant="secondary">رفتن به فروشگاه</Button>
        </Link>
      </div>
    </Container>
  );
}
