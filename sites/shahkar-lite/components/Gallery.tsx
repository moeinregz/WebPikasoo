import { PHOTOS } from "@/lib/site";
import Section from "./Section";

export default function Gallery() {
  return (
    <Section id="gallery" alt title="تصاویر محیط" sub="سالن سرپوشیده با نورپردازی طلایی و باغچه‌ای سرسبز زیر فانوس‌ها.">
      <div className="gallery">
        {PHOTOS.map(([src, caption]) => (
          <figure key={src}>
            <img src={`/images/${src}.webp`} alt={caption} loading="lazy" />
            <figcaption>{caption}</figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
