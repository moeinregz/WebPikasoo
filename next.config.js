/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ---------------------------------------------------------------------
  // Image optimization
  // ---------------------------------------------------------------------
  // Every <Image> in the app (logo, portfolio screenshots, hero slides,
  // blog covers) is served through Next's built-in image optimizer, which
  // automatically re-encodes to AVIF/WebP based on the browser's Accept
  // header — no manual conversion needed for images uploaded later
  // (blog covers, chat attachments) via Vercel Blob.
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimized image responses stay cached (server + browser) for this
    // long before Next re-checks the source — cuts repeat optimization
    // work for images that rarely change (portfolio screenshots, logo).
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      // Vercel Blob storage — blog cover images and chat attachments are
      // uploaded here (see lib/uploads.ts). The hostname always ends in
      // ".public.blob.vercel-storage.com" regardless of which store/project.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Small per-skill logo icons shown in SkillCard (components/SkillCard.tsx).
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
    ],
  },

  // ---------------------------------------------------------------------
  // HTTP caching
  // ---------------------------------------------------------------------
  // Static, content-hashed or rarely-changing assets get a long-lived,
  // immutable Cache-Control so browsers and any CDN in front of the app
  // stop re-requesting them on every visit. Anything dynamic (pages, API
  // routes, server actions) is left alone — Next's defaults already avoid
  // caching those.
  async headers() {
    const immutable = { key: "Cache-Control", value: "public, max-age=31536000, immutable" };
    return [
      {
        source: "/logo.webp",
        headers: [immutable],
      },
      {
        source: "/work/:path*",
        headers: [immutable],
      },
      {
        source: "/screenshots/:path*",
        headers: [immutable],
      },
      {
        // Static demo sites shown at /projects/*.html — content changes
        // rarely enough that an hour of shared caching is safe.
        source: "/projects/:path*.html",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
};

module.exports = nextConfig;
