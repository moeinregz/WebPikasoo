import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getAllArticles, getArticleBySlug } from "@/lib/content/articles";

interface ArticlePageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: `/guide/${article.slug}` },
    openGraph: { title: article.title, description: article.metaDescription, type: "article" },
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
  };

  return (
    <div className="py-6 tablet:py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Container className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "راهنما", href: "/guide" },
            { label: article.title },
          ]}
        />
        <h1 className="text-h1Mobile tablet:text-h1 text-text-primary">{article.title}</h1>
        {/* eslint-disable-next-line react/no-danger */}
        <div className="prose max-w-[70ch] text-body text-text-secondary" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />

        {article.relatedCategory && (
          <div className="pt-4">
            <Link href={`/shop/${article.relatedCategory}`} className="rounded-md bg-brand-black px-5 py-2.5 text-bodySm text-white">
              مشاهده محصولات مرتبط
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
