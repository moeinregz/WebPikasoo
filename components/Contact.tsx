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
        <Reveal id="lead-form" className="mx-auto mt-6 max-w-xl scroll-mt-[90px]">
          <ContactCard>
            <div className="w-full">
              <div className="mb-6 border-b border-ink/10 pb-5 text-center">
                <h2 className="font-display text-[24px] font-normal leading-snug sm:text-[28px]">
                  فرم درخواست <span className="text-blood-hi">مشاوره‌ی رایگان</span>
                </h2>
                <p className="mt-1.5 text-[13px] text-dim">فرم رو پر کن؛ کارشناس ما برای بررسی پروژه‌ت باهات تماس می‌گیره.</p>
              </div>
              <ContactForm defaultName={user?.name} defaultPhone={user?.phone} />
            </div>
          </ContactCard>
        </Reveal>
      </div>
    </section>
  );
}
