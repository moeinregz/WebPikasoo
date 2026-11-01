import Link from "next/link";
import { absoluteUrl } from "@/lib/seo/siteConfig";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      // طبق راهنمای Google برای BreadcrumbList، «item» باید URL مطلق باشد،
      // نه نسبی — وگرنه در Rich Results Test نامعتبر شناخته می‌شود.
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <nav aria-label="مسیر صفحه" className="text-caption text-text-muted">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="hover:text-text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-text-secondary">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && <span aria-hidden="true">‹</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
