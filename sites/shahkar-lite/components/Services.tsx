import { SERVICES } from "@/lib/site";
import Section from "./Section";

const FA = "۰۱۲۳۴۵۶۷۸۹";

export default function Services() {
  return (
    <Section id="services" title="خدمات ما" sub="هر آنچه برای یک شب خوب لازم دارید، در باغچه رستوران شاهکار.">
      <div className="features">
        {SERVICES.map(([title, text], i) => (
          <div className="feature" key={title}>
            <i>{FA[i + 1]}</i>
            <b>{title}</b>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
