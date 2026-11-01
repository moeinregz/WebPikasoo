import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AccountView } from "@/components/account/AccountView";

/**
 * صفحه خصوصی — نباید Index شود (هماهنگ با robots.txt که /account را هم
 * باید Disallow کند، رجوع به اصلاح app/robots.ts در همین مرحله).
 */
export const metadata: Metadata = {
  title: "حساب کاربری",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Container className="py-10 tablet:py-14">
      <h1 className="mb-8 text-h2Mobile tablet:text-h2 text-text-primary">حساب کاربری</h1>
      <AccountView />
    </Container>
  );
}
