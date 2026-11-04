import CursorGlow from "@/components/CursorGlow";
import Events from "@/components/Events";
import Features from "@/components/Features";
import FloatingActions from "@/components/FloatingActions";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import LiveMusic from "@/components/LiveMusic";
import Loader from "@/components/Loader";
import Location from "@/components/Location";
import Menu, { type MenuData } from "@/components/Menu";
import Nav from "@/components/Nav";
import Reserve from "@/components/Reserve";
import Reveal from "@/components/Reveal";
import Ribbon from "@/components/Ribbon";
import Spaces from "@/components/Spaces";
import { getMenu } from "@/lib/db";

// Menu is read from SQLite on every request, so admin edits show up immediately.
export const dynamic = "force-dynamic";

export default function Home() {
  const menu: MenuData = getMenu().map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    items: c.items.map(({ id, name, description, price, featured }) => ({ id, name, description, price, featured })),
  }));

  return (
    <>
      <Loader />
      <Reveal />
      <CursorGlow />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Ribbon />
        <Features />
        <Spaces />
        <Menu data={menu} />
        <LiveMusic />
        <Events />
        <Gallery />
        <Reserve />
        <Location />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
