import { MENU } from "@/lib/site";
import Section from "./Section";

export default function Menu() {
  return (
    <Section id="menu" title="منوی غذا" sub="طعم اصیل ایرانی، از کباب‌های زغالی تا غذاهای خانگی.">
      <div className="menu">
        {MENU.map((col) => (
          <div className="menu-col" key={col.title}>
            <h3>{col.title}</h3>
            <ul>
              {col.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="note">برای منوی کامل و قیمت‌ها تماس بگیرید؛ برای مراسم، منوی اختصاصی هم آماده می‌کنیم.</p>
    </Section>
  );
}
