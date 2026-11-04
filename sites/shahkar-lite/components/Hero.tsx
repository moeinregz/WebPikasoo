import { SITE } from "@/lib/site";

export default function Hero() {
  return (
    <div className="hero">
      <img src="/images/garden-front.webp" alt="باغچه رستوران شاهکار در شب" />
      <div className="wrap">
        <p className="tag">باغچه رستوران · اسلام‌شهر</p>
        <h1>{SITE.name}</h1>
        <p className="lead">میزبان جشن‌ها و میهمانی‌های شما، با غذای اصیل ایرانی و موسیقی زنده در فضای باغ.</p>
        <div className="btns">
          <a className="btn btn-gold" href={SITE.phoneHref}>
            تماس و رزرو: {SITE.phone}
          </a>
          <a className="btn btn-line" href={SITE.whatsappHref} target="_blank" rel="noopener">
            واتساپ
          </a>
        </div>
      </div>
    </div>
  );
}
