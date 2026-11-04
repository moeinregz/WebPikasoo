import { REVIEWS } from "@/lib/content";

export default function Reviews() {
  return (
    <section className="section reviews">
      <div className="section-head">
        <h2>
          مشتری‌ها چی می‌گن؟
          <small>نظر کسایی که از ممد قهوه خرید کردن</small>
        </h2>
      </div>
      <div className="rev-track">
        {REVIEWS.map((r, i) => (
          <figure className="rev" key={i}>
            <div className="stars">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <span className="av" style={{ background: r.color }}>{r.name[0]}</span>
              <span>
                <b>{r.name}</b>
                <small>{r.city} · {r.product}</small>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
