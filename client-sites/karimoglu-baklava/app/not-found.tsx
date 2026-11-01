import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BaklavaSlice } from "@/components/decor/Baklava";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="matte bg-bg-primary bg-lattice">
      <Container className="flex flex-col items-center gap-5 py-24 text-center">
        <BaklavaSlice className="w-40 animate-float" style={{ ["--r" as string]: "-8deg" }} />
        <p className="font-fancy text-[96px] leading-none text-brand-red [text-shadow:-6px_6px_0_#1E1611]">۴۰۴</p>
        <h1 className="font-fancy text-[32px] text-text-primary tablet:text-[40px]">این برش باقلوا پیدا نشد!</h1>
        <p className="max-w-[44ch] text-body text-text-secondary">
          ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه حذف یا جابه‌جا شده باشد.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/">
            <Button variant="primary">بازگشت به صفحه اصلی</Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary">رفتن به فروشگاه</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
