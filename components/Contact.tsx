import Reveal from "./Reveal";
import ContactForm from "./ContactForm";
import { getCurrentUser } from "@/lib/session";
import CTA from "@/components/ui/cta-06";
import { ContactCard } from "@/components/ui/contact-card";

export default async function Contact() {
  const user = await getCurrentUser();

  return (
    <section id="contact" className="relative scroll-mt-[90px] overflow-hidden border-t border-ink/10 pb-[100px] pt-[40px]">
      <div className="relative z-[1] mx-auto max-w-container px-6">
        <CTA />

        {/* فرم مشاوره‌ی رایگان (هدف همه‌ی لینک‌های #lead-form) */}
        <Reveal id="lead-form" className="mx-auto mt-6 max-w-5xl scroll-mt-[90px]">
          <ContactCard
            title="مشاوره‌ی رایگان پروژه‌ت رو رزرو کن"
            description="بدون تعهد و بدون نیاز به ثبت‌نام؛ فقط اسمت، شماره‌ت و یه توضیح کوتاه. بقیه رو تو تماس می‌پرسیم."
          >
            <ContactForm defaultName={user?.name} defaultPhone={user?.phone} />
          </ContactCard>
        </Reveal>
      </div>
    </section>
  );
}
