const ROW_A = ["جشن تولد", "عقد و نامزدی", "موسیقی زنده", "پارکینگ اختصاصی", "غذای ایرانی", "دورهمی خانوادگی", "مهمانی کاری"];
const ROW_B = ["شاهکار", "باغچه رستوران", "اسلام‌شهر", "شب‌های طلایی", "هنرمندان سینما و پاپ", "پذیرایی تمام‌وقت"];

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const seq = [...items, ...items];
  return (
    <div className={`ribbon-row ${reverse ? "is-reverse" : ""}`}>
      <div className="ribbon-track">
        {[0, 1].map((k) => (
          <div className="ribbon-group" key={k} aria-hidden={k === 1}>
            {seq.map((t, i) => (
              <span key={i}>
                {t}
                <i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Ribbon() {
  return (
    <div className="ribbon" aria-label="خدمات شاهکار">
      <Row items={ROW_A} />
      <Row items={ROW_B} reverse />
    </div>
  );
}
