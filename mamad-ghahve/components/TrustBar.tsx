import { STATS, TRUST } from "@/lib/content";

export default function TrustBar() {
  return (
    <section className="section trust">
      <div className="trust-stats">
        {STATS.map((s) => (
          <div key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="trust-grid">
        {TRUST.map((t) => (
          <div className="trust-item" key={t.title}>
            <span className="i">{t.icon}</span>
            <b>{t.title}</b>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
