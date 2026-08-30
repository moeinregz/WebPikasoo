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

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPublishedBlogPostBySlug(decodeSlugParam(params.slug));
  if (!post) return { title: "مقاله پیدا نشد — وب پیکاسو" };
  return {
    title: `${post.title} — وبلاگ وب پیکاسو`,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const isLoggedIn = !!(await getCurrentUser());
  const post = await getPublishedBlogPostBySlug(decodeSlugParam(params.slug));

  if (!post) notFound();

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-[760px] px-6 py-14 lg:py-18">
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="mb-8 aspect-[16/9] w-full rounded-card border border-ink/[0.14] object-cover"
          />
        )}

        <article className="text-[16px] leading-[1.9] text-ink/90">{renderBlogContent(post.content)}</article>
      </main>

      <Footer />
    </>
  );
}
