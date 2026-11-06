import { SERVICES } from "@/lib/site";
import { SERVICE_ICONS } from "./Icons";
import Section from "./Section";

export default function Services() {
  return (
    <Section id="services" title="خدمات ما" sub="هر آنچه برای یک شب خوب لازم دارید، در باغچه رستوران شاهکار.">
      <div className="features">
        {SERVICES.map(([title, text], i) => (
          <div className="feature" key={title}>
            <span className="ic">{SERVICE_ICONS[i]}</span>
            <b>{title}</b>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
