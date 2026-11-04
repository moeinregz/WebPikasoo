import { SITE } from "@/lib/site";

const LINKS = [
  ["#services", "خدمات"],
  ["#gallery", "تصاویر"],
  ["#menu", "منو"],
  ["#events", "مراسم"],
  ["#contact", "تماس و آدرس"],
];

export default function Header() {
  return (
    <header>
      <div className="wrap">
        <a href="#" className="logo">
          {SITE.name}
          <small>باغچه رستوران</small>
        </a>
        <nav>
          {LINKS.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="btn btn-gold" href={SITE.phoneHref}>
          تماس
        </a>
      </div>
    </header>
  );
}
