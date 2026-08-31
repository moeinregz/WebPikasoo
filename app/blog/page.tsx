import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPublishedBlogPosts } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Always read the latest posts straight from the database.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "وبلاگ — وب پیکاسو",
  description: "مقاله‌ها و یادداشت‌های تیم وب پیکاسو درباره‌ی طراحی سایت، توسعه و کسب‌وکار آنلاین.",
};

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
}

export default async function BlogIndexPage() {
  const isLoggedIn = !!(await getCurrentUser());
  const posts = await getPublishedBlogPosts();

  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />

      {/* w-full needed — see the note in app/dashboard/page.tsx's <main>
          about why a direct child of the flex-column <body> collapses to
          its content width without an explicit width. */}
      <main className="mx-auto w-full max-w-container px-6 py-16 lg:py-20">
        <div className="mb-12 text-center">
          <h1 className="font-display text-[32px] font-normal sm:text-[38px]">وبلاگ وب پیکاسو</h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-dim">
            یادداشت‌ها و مقاله‌های تیم درباره‌ی طراحی و توسعه‌ی وب، سئو و رشد کسب‌وکار آنلاین.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink/[0.2] p-16 text-center text-dim">
            هنوز مقاله‌ای منتشر نشده — به‌زودی برمی‌گردیم.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-card border border-ink/[0.14] bg-surface/20 transition hover:-translate-y-1 hover:border-accent/40"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a0a0c]">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-xs text-white/30">
                      وب پیکاسو
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-2 font-mono text-[11.5px] text-dim/70">{formatDate(post.created_at)}</span>
                  <h2 className="mb-2 font-display text-lg font-normal leading-snug">{post.title}</h2>
                  {post.excerpt && (
                    <p className="mb-4 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-dim">{post.excerpt}</p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">
                    ادامه‌ی مطلب
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 rotate-180 transition group-hover:translate-x-[-3px]">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
