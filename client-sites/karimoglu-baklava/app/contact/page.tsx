import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ContactForm } from "@/components/contact/ContactForm";
import { branches } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با باقلوا کریم‌اوغلو — تلفن شعب، ساعات کاری و فرم تماس.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="py-6 tablet:py-10">
      <Container className="grid grid-cols-1 gap-10 desktop:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "تماس با ما" }]} />
          <h1 className="text-h2Mobile tablet:text-h2 text-text-primary">تماس با ما</h1>
          <p className="text-body text-text-secondary">
            برای هر سوال درباره سفارش، محصولات یا شعب، از طریق تلفن شعبه موردنظر یا فرم زیر با ما در
            ارتباط باشید.
          </p>

          <div className="flex flex-col gap-3">
            {branches.map((branch) => (
              <div key={branch.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <p className="text-bodySm text-text-primary">{branch.name}</p>
                  <p className="text-caption text-text-muted">{branch.openingHours}</p>
                  {branch.shortArea && <p className="text-caption text-text-muted">{branch.shortArea}</p>}
                </div>
                {branch.phone ? (
                  <a href={`tel:${branch.phone}`} dir="ltr" className="text-bodySm text-brand-red hover:underline">
                    {branch.phone}
                  </a>
                ) : (
                  <span className="text-caption text-text-muted">تلفن: به‌زودی</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-h3 text-text-primary">فرم تماس</h2>
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
