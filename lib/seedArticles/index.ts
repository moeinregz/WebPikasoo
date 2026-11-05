import type { SeedArticle } from "./types";
import { seedArticlesIfMissing } from "@/lib/db";

// Article modules are added to this list as they're written.
import a01 from "./a01";
import a02 from "./a02";
import a03 from "./a03";
import a04 from "./a04";
import a05 from "./a05";
import a06 from "./a06";
import a07 from "./a07";
import a08 from "./a08";

const modules: SeedArticle[][] = [a01, a02, a03, a04, a05, a06, a07, a08];

export const SEED_ARTICLES: SeedArticle[] = modules.flat();

/** Called from /blog and the sitemap; cheap after the first run. */
export async function ensureSeedArticles(): Promise<void> {
  try {
    await seedArticlesIfMissing(SEED_ARTICLES);
  } catch (e) {
    console.error("seedArticles failed:", e);
  }
}
