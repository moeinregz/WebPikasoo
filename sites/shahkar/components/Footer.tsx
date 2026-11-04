import { SITE } from "@/lib/site";
import { Divider, Emblem } from "./Ornaments";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-top">
        <Emblem className="footer-emblem" />
        <p className="footer-name">شاهکار</p>
        <p className="footer-sub">باغچه رستوران · {SITE.city}</p>
        <Divider />
      </div>
      <div className="footer-grid">
        <a className="footer-card" href={SITE.phoneHref}>
          <span>تلفن</span>
          <b>{SITE.phone}</b>
        </a>
        <a className="footer-card" href={SITE.whatsappHref} target="_blank" rel="noreferrer">
          <span>واتساپ</span>
          <b>{SITE.phone}</b>
        </a>
        <a className="footer-card" href={SITE.instagramHref} target="_blank" rel="noreferrer">
          <span>اینستاگرام</span>
          <b dir="ltr">@{SITE.instagram}</b>
        </a>
      </div>
      <address className="footer-address">{SITE.address}</address>
      <p className="footer-copy">© {new Date().getFullYear()} {SITE.fullName}</p>
    </footer>
  );
}
