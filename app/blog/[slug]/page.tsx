import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPublishedBlogPostBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { renderBlogContent } from "@/lib/blogContent";

// Always read the latest posts straight from the database — never serve a
// stale/pre-rendered version of an article page.
export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
}

/** Next.js hands dynamic route params to us *as they appeared in the URL*
 *  — for a Persian (or any non-ASCII) slug that means still percent-encoded
 *  (e.g. "%DA%86%D8%B7..."), not the decoded "چطور-..." string that's
 *  actually stored in the database. Without this decode step, every post
 *  with a Persian slug 404s the moment you click it from the /blog list,
 *  even though it's right there in the database. */
function decodeSlugParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = decodeSlugParam(params.slug);
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: "مقاله پیدا نشد — وب پیکاسو", robots: { index: false, follow: true } };
  const url = `/blog/${encodeURIComponent(post.slug)}`;
  return {
    title: `${post.title} — وبلاگ وب پیکاسو`,
    description: post.excerpt || undefined,
    // Without this, every post inherited the root layout's canonical of
    // "/" (the homepage) — Google would treat every article as a
    // duplicate of the homepage instead of indexing it on its own.
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime: new Date(post.created_at.replace(" ", "T") + "Z").toISOString(),
      modifiedTime: new Date(post.updated_at.replace(" ", "T") + "Z").toISOString(),
      authors: post.author_name ? [post.author_name] : undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
    twitter: {
      card: post.cover_image ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const isLoggedIn = !!(await getCurrentUser());
  const post = await getPublishedBlogPostBySlug(decodeSlugParam(params.slug));

  if (!post) notFound();

  const postUrl = `${siteUrl}/blog/${encodeURIComponent(post.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: new Date(post.created_at.replace(" ", "T") + "Z").toISOString(),
    dateModified: new Date(post.updated_at.replace(" ", "T") + "Z").toISOString(),
    author: { "@type": post.author_name ? "Person" : "Organization", name: post.author_name || "وب پیکاسو" },
    publisher: {
      "@type": "Organization",
      name: "وب پیکاسو",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.webp` },
    },
  };

  return (
    <>
      {/* Article structured data — lets Google show this post as a rich
          result (author, date, image) instead of a plain blue link. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav isLoggedIn={isLoggedIn} />

      {/* w-full needed — see the note in app/dashboard/page.tsx's <main>
          about why a direct child of the flex-column <body> collapses to
          its content width without an explicit width. */}
      <main className="mx-auto w-full max-w-[760px] px-6 py-14 lg:py-18">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-semibold text-dim transition hover:text-accent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px] rotate-180">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          بازگشت به وبلاگ
        </Link>

        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12.5px] text-dim">
          <span>{formatDate(post.created_at)}</span>
          {post.author_name && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.author_name}</span>
            </>
          )}
        </div>

        <h1 className="mb-6 font-display text-[28px] font-normal leading-tight sm:text-[34px]">{post.title}</h1>

        {post.cover_image && (
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-card border border-ink/[0.14]">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 720px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}

        <article className="text-[16px] leading-[1.9] text-ink/90">{renderBlogContent(post.content)}</article>
      </main>

      <Footer />
    </>
  );
}
