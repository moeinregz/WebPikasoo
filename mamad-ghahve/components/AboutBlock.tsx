import Link from "next/link";
import { ABOUT } from "@/lib/content";

export default function AboutBlock({ phone }: { phone: string }) {
  return (
    <section className="section about">
      <div className="about-art" aria-hidden="true">
        <span className="a1">🫘</span>
        <span className="a2">☕</span>
        <span className="a3">🔥</span>
      </div>
      <div>
        <span className="pill">درباره‌ی ما</span>
        <h2 className="display">{ABOUT.title}</h2>
        <p>{ABOUT.text}</p>
        <ul>
          {ABOUT.points.map((p) => (
            <li key={p}>✓ {p}</li>
          ))}
        </ul>
        <div className="row" style={{ marginTop: 16 }}>
          <Link href="/shop" className="btn">دیدن محصولات</Link>
          <span className="muted" style={{ fontSize: ".9rem" }}>مشاوره: {phone}</span>
        </div>
      </div>
    </section>
  );
}
