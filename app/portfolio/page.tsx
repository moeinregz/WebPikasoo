import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BusinessShowcase from "@/components/BusinessShowcase";
import { getAllProjects, seedProjectsIfEmpty } from "@/lib/db";
import { businessSites } from "@/lib/businessSites";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "نمونه‌کارها — وب پیکاسو",
  description: "گالری سایت‌های کسب‌وکاری که تیم وب پیکاسو طراحی و توسعه داده.",
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
    url: p.url,
    image: p.image,
  }));

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      <BusinessShowcase sites={projects} />

      <Footer />
    </>
  );
}
