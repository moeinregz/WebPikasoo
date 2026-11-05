import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-adaptive tokens — resolve through CSS variables (globals.css)
        // so the same class names repaint automatically between light/dark.
        // Dark is the default theme now (pure black canvas, Vercel/GitHub-style).
        ink: "rgb(var(--color-ink) / <alpha-value>)", // primary text/foreground
        dim: "rgb(var(--color-dim) / <alpha-value>)", // secondary text
        canvas: "rgb(var(--color-canvas) / <alpha-value>)", // page background
        surface: "rgb(var(--color-surface) / <alpha-value>)", // card/panel fill

        // Brand accents — Midnight Black + Electric Blue + Cantaloupe Orange.
        // Theme-adaptive (CSS variables in globals.css).
        accent: "rgb(var(--color-accent) / <alpha-value>)", // آبی الکتریکی — دکمه‌ها، لینک‌ها، برند
        accent2: "rgb(var(--color-accent2) / <alpha-value>)", // نارنجی طالبی — تأکید، هاله‌ها
        accent3: "rgb(var(--color-accent3) / <alpha-value>)", // آبی روشن — نقطه‌ی وضعیت و جزئیات
        // Text on an electric-blue fill.
        "on-accent": "#FFFFFF",
        midnight: "#02070A",
        electric: "#0297DE",
        cantaloupe: "#FC734D",

        // Old palette names kept so existing classes recolor: blue scale.
        "deep-twilight": "#02070A",
        "french-blue": "#01557F",
        "bright-teal-blue": "#0277B6",
        "blue-green": "#0297DE",
        "turquoise-surf": "#0297DE",
        "sky-aqua": "#5CC4FF",
        "frosted-blue": "#BFE6FA",
        "frosted-blue-2": "#DDF2FC",
        "light-cyan": "#EEF8FD",

        // Legacy aliases — kept so components outside the redesigned landing
        // page (account/dashboard) still render sensibly against the new
        // dark-first palette without needing a separate rewrite pass.
        navy: "#02070A",
        alabaster: "#f5f5f7",
      },
      fontFamily: {
        fa: ["var(--font-vazirmatn)", "sans-serif"],
        display: ["var(--font-serif)", "var(--font-naskh)", "serif"],
        serif: ["var(--font-serif)", "var(--font-naskh)", "serif"],
        // JetBrains Mono کلاً از پروژه حذف شد — فقط لاتین رو پوشش می‌داد و
        // باعث می‌شد حروف فارسی داخل badge/آمار‌های font-mono با فونت
        // پیش‌فرض/محو مرورگر رندر بشن. حالا font-mono هم مستقیم همون
        // Vazirmatn هست، یعنی همه‌جای سایت یکدست و بدون فال‌بک ناهماهنگ.
        // Persian first: the Latin mono font would supply a very wide space
        // character and pull Persian words apart. Use `font-plex` for Latin-only mono.
        mono: ["var(--font-vazirmatn)", "monospace"],
        plex: ["var(--font-plex-mono)", "monospace"],
      },
      maxWidth: {
        container: "1160px",
      },
      borderRadius: {
        card: "16px",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgb(var(--color-ink) / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-ink) / 0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "44px 44px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(2, 151, 222, 0.35), 0 8px 40px -8px rgba(2, 151, 222, 0.45)",
        "glow-violet": "0 0 0 1px rgba(252, 115, 77, 0.35), 0 8px 40px -8px rgba(252, 115, 77, 0.45)",
        "glow-soft": "0 20px 60px -20px rgba(2, 151, 222, 0.35)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".35", transform: "scale(1.4)" },
        },
        blinkCursor: {
          "50%": { opacity: "0" },
        },
        marqueeLtr: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        marqueeRtl: {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: ".55" },
          "50%": { opacity: "1" },
        },
        titleDrop: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        rainIn: {
          "0%": { opacity: "0", transform: "translateY(-14px)" },
          "60%": { opacity: "1" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        arrowUp: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        floatGlow: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-3%, 3%) scale(1.06)" },
        },
        gradientMove: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        // --- لودینگ صفحه (app/loading.tsx) — تکه‌های هندسی که به شکل
        // یه چهره‌ی کوبیستی (الهام از لوگو) کنار هم جمع می‌شن، یه لحظه
        // می‌مونن، دوباره از هم می‌پاشن؛ حلقه‌وار تکرار می‌شه. ---
        assemblePiece: {
          "0%": {
            transform:
              "translate(var(--dx, 0px), var(--dy, 0px)) rotate(var(--dr, 0deg)) scale(.45)",
            opacity: "0",
          },
          "22%": { opacity: "1" },
          "40%, 62%": {
            transform: "translate(0, 0) rotate(0deg) scale(1)",
            opacity: "1",
          },
          "80%": { opacity: "1" },
          "100%": {
            transform:
              "translate(var(--dx, 0px), var(--dy, 0px)) rotate(var(--dr, 0deg)) scale(.45)",
            opacity: "0",
          },
        },
        centerMarkFade: {
          "0%, 34%": { opacity: "0", transform: "scale(.6)" },
          "44%, 60%": { opacity: "1", transform: "scale(1)" },
          "72%, 100%": { opacity: "0", transform: "scale(.6)" },
        },
        loaderBarSlide: {
          "0%": { transform: "translateX(-110%)" },
          "50%": { transform: "translateX(60%)" },
          "100%": { transform: "translateX(230%)" },
        },

        // --- صفحه‌ی 404 — افکت گلیچ روی عدد 404 + چشمی که دنبال صفحه
        // می‌گرده و پلک می‌زنه. ---
        glitchShift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "20%": { transform: "translate(-3px, 2px)" },
          "40%": { transform: "translate(3px, -2px)" },
          "60%": { transform: "translate(-2px, -1px)" },
          "80%": { transform: "translate(2px, 1px)" },
        },
        glitchClip: {
          "0%, 100%": { clipPath: "inset(0 0 0 0)" },
          "10%": { clipPath: "inset(10% 0 62% 0)" },
          "30%": { clipPath: "inset(58% 0 4% 0)" },
          "50%": { clipPath: "inset(28% 0 42% 0)" },
          "70%": { clipPath: "inset(4% 0 72% 0)" },
          "90%": { clipPath: "inset(48% 0 18% 0)" },
        },
        eyeLook: {
          "0%, 15%": { transform: "translateX(-16px)" },
          "40%, 55%": { transform: "translateX(16px)" },
          "80%, 100%": { transform: "translateX(-16px)" },
        },
        eyeBlink: {
          "0%, 92%, 100%": { transform: "scaleY(1)" },
          "95%": { transform: "scaleY(.1)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 2.4s ease-in-out infinite",
        "blink-cursor": "blinkCursor 1s step-end infinite",
        "marquee-ltr": "marqueeLtr 85s linear infinite",
        "marquee-rtl": "marqueeRtl 100s linear infinite",
        "pulse-soft": "pulseSoft 4.5s ease-in-out infinite",
        "title-drop": "titleDrop .45s cubic-bezier(.16,1,.3,1) forwards",
        "rain-in": "rainIn .5s cubic-bezier(.16,1,.3,1) forwards",
        "arrow-up": "arrowUp 2.2s ease-in-out infinite",
        "float-glow": "floatGlow 9s ease-in-out infinite",
        "float-glow-slow": "floatGlow 13s ease-in-out infinite reverse",
        "gradient-move": "gradientMove 6s ease infinite",
        "fade-in-up": "fadeInUp .6s cubic-bezier(.16,1,.3,1) forwards",

        "assemble-piece": "assemblePiece 3.6s ease-in-out infinite",
        "center-mark-fade": "centerMarkFade 3.6s ease-in-out infinite",
        "loader-bar-slide": "loaderBarSlide 1.7s ease-in-out infinite",
        "spin-slow": "spin 6s linear infinite",
        "gradient-move-fast": "gradientMove 2.2s ease infinite",

        "glitch-shift": "glitchShift 3s ease-in-out infinite",
        "glitch-clip-1": "glitchClip 3.4s steps(10) infinite",
        "glitch-clip-2": "glitchClip 2.7s steps(8) infinite reverse",
        "eye-look": "eyeLook 4.5s ease-in-out infinite",
        "eye-blink": "eyeBlink 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
