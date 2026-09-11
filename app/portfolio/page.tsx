import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BusinessShowcase from "@/components/BusinessShowcase";
import { getAllProjects, seedProjectsIfEmpty } from "@/lib/db";
import { businessSites } from "@/lib/businessSites";
import { projectViewUrl } from "@/lib/projectLink";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "نمونه‌کارها — وب پیکاسو",
  description: "گالری سایت‌های کسب‌وکاری که تیم وب پیکاسو طراحی و توسعه داده.",
  alternates: { canonical: "/portfolio" },
  openGraph: { url: "/portfolio", title: "نمونه‌کارها — وب پیکاسو", description: "گالری سایت‌های کسب‌وکاری که تیم وب پیکاسو طراحی و توسعه داده." },
};

export default async function PortfolioPage() {
  const isLoggedIn = !!(await getCurrentUser());

  await seedProjectsIfEmpty(
    businessSites.map((s) => ({
      name: s.name,
      category: s.category,
      description: s.desc,
      url: s.url,
      image: s.image,
    }))
  );
  const allProjects = await getAllProjects();
  const projects = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    desc: p.description,
    url: projectViewUrl(p),
    image: p.image,
  }));

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      {/* This page had no <h1> at all before — BusinessShowcase starts
          straight with the filter/grid. Every indexable page needs exactly
          one h1 that states what the page is; this is that one. */}
      <div className="mx-auto max-w-container px-6 pt-14 text-center sm:pt-20">
        <h1 className="font-display text-[32px] font-normal sm:text-[40px]">نمونه‌کارهای وب پیکاسو</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-dim">
          گالری سایت‌های کسب‌وکاری که طراحی و توسعه داده‌ایم.
        </p>
      </div>

      <BusinessShowcase sites={projects} />

      <Footer />
    </>
  );
}
