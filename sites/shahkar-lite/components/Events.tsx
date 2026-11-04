import { EVENTS, waLink } from "@/lib/site";

export default function Events() {
  return (
    <section id="events" className="alt">
      <div className="wrap events">
        <img src="/images/hall-wide.webp" alt="سالن پذیرایی شاهکار" loading="lazy" />
        <div>
          <h2 style={{ textAlign: "start" }}>جشن‌ها و میهمانی‌ها</h2>
          <ul className="chips">
            {EVENTS.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p>
            شاهکار آماده‌ی پذیرایی از جشن‌ها و میهمانی‌های شما به‌صورت تمام‌وقت است. شب‌ها با موسیقی زنده و در
            شب‌های ویژه با حضور هنرمندان سینما و موزیک پاپ کشور.
          </p>
          <p style={{ marginTop: "1.2rem" }}>
            <a
              className="btn btn-gold"
              href={waLink("سلام، برای رزرو مراسم در شاهکار اطلاعات می‌خواستم.")}
              target="_blank"
              rel="noopener"
            >
              رزرو مراسم در واتساپ
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
