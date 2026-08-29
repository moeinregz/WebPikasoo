import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPublishedBlogPostBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { renderBlogContent } from "@/lib/blogContent";

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) return { title: "مقاله پیدا نشد — وب پیکاسو" };
  return {
    title: `${post.title} — وبلاگ وب پیکاسو`,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const isLoggedIn = !!(await getCurrentUser());
  const post = await getPublishedBlogPostBySlug(params.slug);

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
