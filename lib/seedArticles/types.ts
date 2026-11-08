/** A ready-written SEO article shipped with the code and inserted into the
 *  blog once (see seedArticlesIfMissing in lib/db.ts). Content uses the blog's
 *  markdown-lite: ## / ### headings, "- " lists, [text](url) links, and
 *  ![alt](/blog-placeholder.svg) image slots on their own line. */
export type SeedArticle = {
  slug: string;
  /** main keyword — starts the title, ~2% density in the body */
  keyword: string;
  title: string;
  /** meta description, 145–160 characters */
  excerpt: string;
  content: string;
  /** how many days ago it counts as published (spreads the dates) */
  daysAgo: number;
};
