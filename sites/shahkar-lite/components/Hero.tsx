import { SITE } from "@/lib/site";
import { InstagramIcon, PhoneIcon, WhatsAppIcon } from "./Icons";

export default function Hero() {
  return (
    <div className="hero">
      <img src="/images/garden-front.webp" alt="باغچه رستوران شاهکار در شب، با فانوس‌های رنگی" />
      <div className="lights" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="wrap">
        <div className="hero-card">
          <p className="tag">باغچه رستوران · اسلام‌شهر</p>
          <h1>{SITE.name}</h1>
          <p className="lead">میزبان جشن‌ها و میهمانی‌های شما، با غذای اصیل ایرانی و موسیقی زنده در فضای باغ.</p>
          <div className="btns">
            <a className="btn btn-gold" href={SITE.phoneHref}>
              <PhoneIcon /> تماس و رزرو: {SITE.phone}
            </a>
            <a className="btn btn-wa" href={SITE.whatsappHref} target="_blank" rel="noopener">
              <WhatsAppIcon /> واتساپ
            </a>
          </div>
          <div className="insta-row">
            <a className="btn btn-insta" href={SITE.instagramHref} target="_blank" rel="noopener">
              <InstagramIcon /> <span dir="ltr">@{SITE.instagram}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
