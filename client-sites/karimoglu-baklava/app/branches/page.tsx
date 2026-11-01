import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { branches } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "شعبه‌های کریم‌اوغلو در تهران و همدان",
  description:
    "فهرست شعبه‌های باقلوا کریم‌اوغلو در تهران (ستارخان، آریاشهر، کوروش مال، تجریش، پیروزی) و همدان — آدرس، تلفن و ساعت کاری هر شعبه.",
  alternates: { canonical: "/branches" },
};

export default function BranchesIndexPage() {
  const tehranBranches = branches.filter((b) => b.city === "تهران");
  const hamedanBranches = branches.filter((b) => b.city === "همدان");

  return (
    <div className="py-6 tablet:py-10">
      <Container className="flex flex-col gap-8">
        <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "شعبه‌ها" }]} />

        <div className="flex flex-col gap-2">
          <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">شعبه‌های باقلوا کریم‌اوغلو</h1>
          <p className="max-w-[70ch] text-body text-text-secondary">
            باقلوا کریم‌اوغلو با {branches.length} شعبه فعال در تهران و همدان، آماده ارسال فوری و همان‌روز باقلوا،
            استانبولی، باقلوا عربی و شیرینی خشک است.
          </p>
        </div>

        <BranchCityGroup title={`شعبه‌های تهران`} items={tehranBranches} />
        {hamedanBranches.length > 0 && <BranchCityGroup title="شعبه همدان" items={hamedanBranches} />}
      </Container>
    </div>
  );
}

function BranchCityGroup({ title, items }: { title: string; items: typeof branches }) {
  return (
    <section aria-labelledby={`${title}-heading`} className="flex flex-col gap-4">
      <h2 id={`${title}-heading`} className="text-h3 text-text-primary">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {items.map((branch) => (
          <Link
            key={branch.id}
            href={`/branches/${branch.slug}`}
            className="flex flex-col gap-2 rounded-lg bg-surface p-4 shadow-sm hover:ring-1 hover:ring-brand-black"
          >
            <p className="text-h4 text-text-primary">{branch.name}</p>
            <p className="text-caption text-text-muted">{branch.city}</p>
            {branch.shortArea && <p className="text-bodySm text-text-secondary">{branch.shortArea}</p>}
            {branch.phone && (
              <p className="text-bodySm text-text-secondary" dir="ltr">
                {branch.phone}
              </p>
            )}
            <p className="text-caption text-text-muted">ساعت کاری: {branch.openingHours}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
