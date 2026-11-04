import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <>
      <footer>
        <b>{SITE.fullName}</b> · اسلام‌شهر
        <br />© ۱۴۰۵ — همه‌ی حقوق محفوظ است
      </footer>
      <div className="call-bar">
        <a className="btn btn-gold" href={SITE.phoneHref}>
          تماس
        </a>
        <a className="btn btn-line" href={SITE.whatsappHref} target="_blank" rel="noopener">
          واتساپ
        </a>
      </div>
    </>
  );
}
