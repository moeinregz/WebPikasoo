import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/fx/Reveal";
import { BaklavaDiamond, BaklavaSlice } from "@/components/decor/Baklava";
import { categoryShowcase } from "@/lib/mock-data";

// هر کارت یک رنگ مات از پالت می‌گیرد (چرخشی)
const TONES = [
  { bg: "bg-honey", pattern: "bg-lattice-honey" },
  { bg: "bg-pistachio", pattern: "bg-lattice-pistachio" },
  { bg: "bg-brand-redLight", pattern: "bg-lattice" },
  { bg: "bg-cream-deep", pattern: "bg-lattice" },
  { bg: "bg-pistachio-light", pattern: "bg-lattice-pistachio" },
  { bg: "bg-honey-light", pattern: "bg-lattice" },
];

export function CategoryShowcase() {
  return (
    <section aria-labelledby="category-heading" className="matte relative bg-bg-primary py-16 tablet:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading id="category-heading" eyebrow="دسته‌بندی‌ها" title="از میان طعم‌های ما انتخاب کنید" />
        <Stagger className="grid grid-cols-2 gap-x-4 gap-y-8 tablet:grid-cols-3 desktop:grid-cols-6">
          {categoryShowcase.map((category, i) => {
            const tone = TONES[i % TONES.length]!;
            return (
              <StaggerItem key={category.id}>
                <Link
                  href={`/shop/${category.id}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-[999px_999px_20px_20px] border-2 border-brand-black bg-surface p-2 pb-4 text-center shadow-hard transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:translate-x-1 hover:shadow-hard-lg"
                >
                  <div
                    className={`arch relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden border-2 border-brand-black ${tone.bg} ${tone.pattern}`}
                  >
                    {i % 2 === 0 ? (
                      <BaklavaDiamond
                        topping={i % 4 === 0 ? "pistachio" : "walnut"}
                        className="w-[62%] transition-transform duration-500 ease-out group-hover:rotate-[45deg] group-hover:scale-110"
                      />
                    ) : (
                      <BaklavaSlice
                        topping={i % 3 === 0 ? "walnut" : "pistachio"}
                        className="w-[78%] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-6 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <div className="px-1">
                    <h3 className="font-fancy text-[22px] leading-tight text-text-primary transition-colors group-hover:text-brand-red">
                      {category.label}
                    </h3>
                    <p className="text-caption text-text-muted">{category.description}</p>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
