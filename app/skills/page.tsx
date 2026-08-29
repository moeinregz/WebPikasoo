import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Skills from "@/components/Skills";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "مهارت‌های فنی — وب پیکاسو",
  description: "فهرست کامل تکنولوژی‌ها و ابزارهایی که تیم وب پیکاسو باهاشون کار می‌کنه.",
};

export default async function SkillsPage() {
  const isLoggedIn = !!(await getCurrentUser());

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />
      <Skills />
      <Footer />
    </>
  );
}
