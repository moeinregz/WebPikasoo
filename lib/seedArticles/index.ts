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
import a09 from "./a09";
import a10 from "./a10";
import a11 from "./a11";
import a12 from "./a12";
import a13 from "./a13";
import a14 from "./a14";
import a15 from "./a15";
import a16 from "./a16";
import a17 from "./a17";
import a18 from "./a18";
import a19 from "./a19";
import a20 from "./a20";
import a21 from "./a21";
import a22 from "./a22";

const modules: SeedArticle[][] = [a01, a02, a03, a04, a05, a06, a07, a08, a09, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22];

export const SEED_ARTICLES: SeedArticle[] = modules.flat();

/** Called from /blog and the sitemap; cheap after the first run. */
export async function ensureSeedArticles(): Promise<void> {
  try {
    await seedArticlesIfMissing(SEED_ARTICLES);
  } catch (e) {
    console.error("seedArticles failed:", e);
  }
}
