import Contact from "@/components/Contact";
import Events from "@/components/Events";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import Services from "@/components/Services";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Services />
      <Gallery />
      <Menu />
      <Events />
      <Contact />
      <Footer />
    </>
  );
}
