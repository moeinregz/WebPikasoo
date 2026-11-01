import { beforeAll, describe, expect, it } from "vitest";
import sitemap from "../../../app/sitemap";
import robots from "../../../app/robots";
import { buildListingCanonical } from "../canonical";
import { buildLocalBusinessSchema } from "../localBusinessSchema";
import { branches, allProducts, categoryShowcase } from "@/lib/mock-data";
import { SITE_URL } from "../siteConfig";

/**
 * ===== تست‌های خودکار SEO (Prompt 12، بخش ۲۴) =====
 *
 * این تست‌ها همان چیزهایی را بررسی می‌کنند که بدون مرورگر واقعی/Lighthouse
 * قابل‌تأیید برنامه‌نویسی هستند: ساختار Sitemap، قوانین robots.txt، منطق
 * Canonical، و صحت Structured Data. موارد نیازمند رندر واقعی (Broken Links،
 * Multiple H1 در DOM، Missing Alt در تصاویر واقعی) در چک‌لیست دستی پایان
 * سند SEO Architecture فهرست شده‌اند، چون این پروژه هنوز ابزار Headless
 * Browser (Playwright/Lighthouse CI) ندارد.
 */

describe("sitemap.xml", () => {
  // Sitemap از دیتابیس می‌خواند (async)؛ نتیجه یک‌بار قبل از تست‌ها گرفته می‌شود
  let entries: Awaited<ReturnType<typeof sitemap>> = [];
  beforeAll(async () => {
    entries = await sitemap();
  });

  it("never includes private/internal paths", () => {
    const privatePrefixes = ["/admin", "/api", "/cart", "/checkout", "/order", "/payment"];
    for (const entry of entries) {
      const path = entry.url.replace(SITE_URL, "");
      for (const prefix of privatePrefixes) {
        expect(path.startsWith(prefix)).toBe(false);
      }
    }
  });

  it("includes the homepage, shop, and branches index", () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/shop`);
    expect(urls).toContain(`${SITE_URL}/branches`);
  });

  it("includes every category page exactly once", () => {
    const urls = entries.map((e) => e.url);
    for (const category of categoryShowcase) {
      const matches = urls.filter((u) => u === `${SITE_URL}/shop/${category.id}`);
      expect(matches).toHaveLength(1);
    }
  });

  it("includes every active branch page exactly once", () => {
    const urls = entries.map((e) => e.url);
    for (const branch of branches) {
      const matches = urls.filter((u) => u === `${SITE_URL}/branches/${branch.slug}`);
      expect(matches).toHaveLength(1);
    }
  });

  it("only includes available products (never a product hidden from sale)", () => {
    const urls = new Set(entries.map((e) => e.url));
    const unavailable = allProducts.filter((p) => !p.isAvailable);
    for (const product of unavailable) {
      expect(urls.has(`${SITE_URL}/product/${product.slug}`)).toBe(false);
    }
  });

  it("produces no duplicate URLs", () => {
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("robots.txt", () => {
  const config = robots();

  it("points to the real sitemap URL", () => {
    expect(config.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("blocks all private areas explicitly", () => {
    const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    const disallow = rule?.disallow;
    const list = Array.isArray(disallow) ? disallow : [disallow];
    for (const path of ["/admin", "/api", "/cart", "/checkout", "/order", "/payment"]) {
      expect(list).toContain(path);
    }
  });

  it("does not block the storefront itself", () => {
    const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    expect(rule?.allow).toBe("/");
  });
});

describe("listing canonical strategy (pagination/filters)", () => {
  it("canonicalizes page 1 (or no page param) to the clean base path", () => {
    expect(buildListingCanonical("/shop", {})).toBe("/shop");
    expect(buildListingCanonical("/shop", { page: "1" })).toBe("/shop");
  });

  it("self-canonicalizes page 2+ instead of pointing back to page 1", () => {
    expect(buildListingCanonical("/shop", { page: "3" })).toBe("/shop?page=3");
  });

  it("never lets filter/sort/search params leak into the canonical URL", () => {
    const result = buildListingCanonical("/shop/baklava", {
      page: "2",
      sort: "price_asc",
      unit: "weight",
      q: "پسته",
      min: "10000",
    });
    expect(result).toBe("/shop/baklava?page=2");
  });

  it("ignores an invalid/non-numeric page value rather than producing a broken canonical", () => {
    expect(buildListingCanonical("/shop", { page: "not-a-number" })).toBe("/shop");
  });
});

describe("LocalBusiness structured data (branch pages)", () => {
  it("never fabricates geo coordinates when the branch has none on file", () => {
    const branchWithoutCoordinates = branches.find((b) => !b.coordinates);
    expect(branchWithoutCoordinates).toBeDefined();
    const schema = buildLocalBusinessSchema(branchWithoutCoordinates!) as Record<string, unknown>;
    expect(schema.geo).toBeUndefined();
  });

  it("includes the real phone number when present", () => {
    const branchWithPhone = branches.find((b) => b.phone);
    expect(branchWithPhone).toBeDefined();
    const schema = buildLocalBusinessSchema(branchWithPhone!) as Record<string, unknown>;
    expect(schema.telephone).toBe(branchWithPhone!.phone);
  });

  it("always includes the real city as address locality", () => {
    for (const branch of branches) {
      const schema = buildLocalBusinessSchema(branch) as { address: { addressLocality: string } };
      expect(schema.address.addressLocality).toBe(branch.city);
    }
  });

  it("produces a resolvable, branch-specific canonical URL", () => {
    for (const branch of branches) {
      const schema = buildLocalBusinessSchema(branch) as { url: string };
      expect(schema.url).toBe(`${SITE_URL}/branches/${branch.slug}`);
    }
  });
});

describe("metadata uniqueness (duplicate title check)", () => {
  it("category pages never produce duplicate titles", () => {
    const titles = categoryShowcase.map((c) => `خرید ${c.label}`);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("product pages never produce duplicate titles (by slug)", () => {
    const titles = allProducts.map((p) => `خرید ${p.name}`);
    // نام محصولات ممکن است در آینده تکراری شود (دو محصول با یک نام)؛ این تست
    // فقط برای کاتالوگ فعلی هشدار می‌دهد، نه یک قانون ساختاری غیرقابل‌نقض.
    expect(new Set(titles).size).toBe(titles.length);
  });
});
