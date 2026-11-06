import { SITE, STEPS } from "@/lib/site";
import Section from "./Section";

export default function Contact() {
  return (
    <Section id="contact" title="تماس و آدرس" sub="برای رزرو میز یا مراسم تماس بگیرید یا در واتساپ پیام بدهید.">
      <div className="contact">
        <div className="box">
          <h3>مسیر</h3>
          <ol>
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <address>{SITE.address}</address>
          <div className="btns">
            <a className="btn btn-gold" href={SITE.mapHref} target="_blank" rel="noopener">
              مسیریابی
            </a>
          </div>
        </div>
        <div className="box rows">
          <h3>راه‌های ارتباطی</h3>
          <a href={SITE.phoneHref}>
            <span>تلفن</span>
            <b>{SITE.phone}</b>
          </a>
          <a className="wa" href={SITE.whatsappHref} target="_blank" rel="noopener">
            <span>واتساپ</span>
            <b>{SITE.phone}</b>
          </a>
          <a className="ig" href={SITE.instagramHref} target="_blank" rel="noopener">
            <span>اینستاگرام</span>
            <b dir="ltr">@{SITE.instagram}</b>
          </a>
        </div>
      </div>
    </Section>
  );
}
