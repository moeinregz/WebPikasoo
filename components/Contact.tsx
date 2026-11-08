import { AtSign, Clock, Mail, MessageCircle, Phone, Send } from "lucide-react";
import Reveal from "./Reveal";
import ContactForm from "./ContactForm";
import { getCurrentUser } from "@/lib/session";
import CTA from "@/components/ui/cta-06";
import { ContactCard } from "@/components/ui/contact-card";

const contactInfo = [
  { icon: Phone, label: "تماس", value: "0996 574 5535", href: "tel:+989965745535" },
  { icon: MessageCircle, label: "واتساپ", value: "چت کن", href: "https://wa.me/989965745535" },
  { icon: Send, label: "تلگرام", value: "WebPikaso@", href: "https://t.me/WebPikaso" },
  { icon: AtSign, label: "اینستاگرام", value: "regzly@", href: "https://instagram.com/regzly" },
  { icon: Mail, label: "ایمیل", value: "webpikaso@gmail.com", href: "mailto:webpikaso@gmail.com" },
  { icon: Clock, label: "ساعت پاسخ‌گویی", value: "شنبه تا پنجشنبه، ۱۰ تا ۱۶" },
];

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
            description="بدون تعهد و بدون نیاز به ثبت‌نام؛ فقط اسمت، شماره‌ت و یه توضیح کوتاه. بقیه رو تو تماس می‌پرسیم، یا از هر کدوم از این راه‌ها مستقیم پیام بده."
            contactInfo={contactInfo}
          >
            <ContactForm defaultName={user?.name} defaultPhone={user?.phone} />
          </ContactCard>
        </Reveal>
      </div>
    </section>
  );
}
