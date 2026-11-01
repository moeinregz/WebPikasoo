import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function OrderNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-20 text-center">
      <span aria-hidden="true" className="text-h1">
        📦
      </span>
      <h1 className="text-h2 text-text-primary">این سفارش پیدا نشد</h1>
      <p className="max-w-[40ch] text-body text-text-secondary">
        ممکن است لینک اشتباه باشد یا این سفارش هنوز ثبت نشده باشد.
      </p>
      <Link href="/shop">
        <Button variant="primary">بازگشت به فروشگاه</Button>
      </Link>
    </Container>
  );
}
