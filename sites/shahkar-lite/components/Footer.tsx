import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <>
      <footer>
        <b>{SITE.fullName}</b> · اسلام‌شهر ·{" "}
        <a href={SITE.instagramHref} target="_blank" rel="noopener" dir="ltr">
          @{SITE.instagram}
        </a>
        <br />© ۱۴۰۵ — همه‌ی حقوق محفوظ است
      </footer>
      <div className="call-bar">
        <a className="btn btn-gold" href={SITE.phoneHref}>
          تماس
        </a>
        <a className="btn btn-wa" href={SITE.whatsappHref} target="_blank" rel="noopener">
          واتساپ
        </a>
      </div>
    </>
  );
}
