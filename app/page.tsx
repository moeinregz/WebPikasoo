import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Trust from "@/components/Trust";
import BusinessShowcase from "@/components/BusinessShowcase";
import Testimonials from "@/components/Testimonials";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getAllProjects, seedProjectsIfEmpty } from "@/lib/db";
import { businessSites } from "@/lib/businessSites";
import { projectViewUrl } from "@/lib/projectLink";
import { getCurrentUser } from "@/lib/session";

// Homepage previously had no metadata of its own and silently inherited
// the generic root layout title/description for every visit — the single
// highest-value page on the whole site had nothing tailored to it.
export const metadata = {
  title: "وب پیکاسو — طراحی سایت، توسعه نرم‌افزار و سئو",
  description:
    "وب پیکاسو، تیم طراحی و توسعه سایت و نرم‌افزار؛ پنل‌های مدیریتی، فروشگاه اینترنتی، وب اپلیکیشن و سئو حرفه‌ای برای کسب‌وکار شما.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const isLoggedIn = !!(await getCurrentUser());

  // First-ever load: copy the old hardcoded showcase list into the new
  // admin-manageable `projects` collection (no-op once it's populated).
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
      <Hero />
      <Marquee />
      <BusinessShowcase sites={projects} />
      <Services />
      <Trust />
      <Process />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
