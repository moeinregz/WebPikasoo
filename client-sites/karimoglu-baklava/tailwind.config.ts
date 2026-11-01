import type { Config } from "tailwindcss";

// این فایل مستقیماً از سند Design System (Prompt 3) مشتق شده است.
// هر مقدار رنگ/سایز/radius/shadow دقیقاً همان Token های تعریف‌شده در آن سند است
// تا هیچ مقدار سلیقه‌ای جدیدی در سطح کد وارد نشود.

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "16px",
        tablet: "24px",
        desktop: "32px",
      },
    },
    screens: {
      sm: "480px",
      tablet: "768px",
      desktop: "1024px",
      "desktop-lg": "1280px",
    },
    extend: {
      colors: {
        // ===== پالت «مات» الهام‌گرفته از باقلوا =====
        // همه رنگ‌ها کاملاً اپک (بدون شفافیت) و با اشباع کنترل‌شده‌اند تا
        // حس سطح مات کاغذ/خمیر داشته باشند، نه براقی پلاستیکی.
        brand: {
          black: "#1E1611", // شکلاتی-مشکی گرم به‌جای مشکی خالص
          blackDeep: "#140E0A",
          red: "#B8273A", // قرمز فینه (کلاه لوگو) — نسخه مات
          redDark: "#8C1C2C",
          redLight: "#F3D9D6",
        },
        honey: {
          DEFAULT: "#DFA03F", // شهد عسل
          deep: "#B0721F",
          light: "#F5E2B8",
        },
        pistachio: {
          DEFAULT: "#8EA05E", // مغز پسته
          deep: "#4E6534",
          light: "#DEE5C4",
        },
        cocoa: {
          DEFAULT: "#2E2018", // گردو برشته
          light: "#4A3427",
          soft: "#6B4E3B",
        },
        cream: {
          DEFAULT: "#F6EEDF", // خمیر یوفکا
          deep: "#EADCC2",
        },
        bg: {
          primary: "#F8F2E7",
          secondary: "#EFE4D0",
        },
        surface: {
          DEFAULT: "#FFFBF3",
          dark: "#2E2018",
        },
        text: {
          primary: "#1E1611",
          secondary: "#54453A",
          muted: "#8D7B6B",
          inverse: "#F8F2E7",
          inverseMuted: "#CDBBA5",
        },
        border: {
          DEFAULT: "#E2D4BC",
          strong: "#C9B597",
          dark: "#4A3427",
        },
        state: {
          success: "#2F7D4F",
          successBg: "#E7F3EC",
          warning: "#B5730B",
          warningBg: "#FBF0DC",
          error: "#C81E3A",
          errorBg: "#F7E4E8",
          info: "#2A5C8A",
          infoBg: "#E6EEF5",
        },
      },
      fontFamily: {
        // Token انتزاعی طبق Design System — تا رسیدن فونت رسمی برند
        // با Vazirmatn به‌عنوان جایگزین موقت پر می‌شود (بخش README را ببینید)
        primary: ["var(--font-primary)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        // فونت تیتر نمایشی (لاله‌زار) — حس دست‌نوشته سنتی شیرینی‌فروشی‌ها
        fancy: ["var(--font-fancy)", "var(--font-display)", "sans-serif"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "800" }],
        h1: ["36px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        h2: ["28px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        h3: ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        h4: ["18px", { lineHeight: "1.35", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        bodySm: ["14px", { lineHeight: "1.55", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "400" }],
        btn: ["15px", { lineHeight: "1", letterSpacing: "0.01em", fontWeight: "600" }],
        label: ["13px", { lineHeight: "1.3", letterSpacing: "0.02em", fontWeight: "500" }],
        price: ["22px", { lineHeight: "1.2", fontWeight: "700" }],
        priceSm: ["15px", { lineHeight: "1.2", fontWeight: "400" }],
        stat: ["32px", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "800" }],
        displayMobile: ["32px", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "800" }],
        h1Mobile: ["28px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        h2Mobile: ["22px", { lineHeight: "1.25", fontWeight: "700" }],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        full: "999px",
        image: "12px",
      },
      // ===== سایه‌های «سخت» و کاملاً غیرشفاف =====
      // به‌جای سایه‌های محو rgba، یک بلوک رنگی اپک با آفست ثابت (جهت پایین-چپ
      // به تناسب چیدمان RTL) — حس برچسب/جعبه شیرینی چاپی.
      boxShadow: {
        sm: "-3px 3px 0 0 #E2D4BC",
        md: "-5px 5px 0 0 #1E1611",
        lg: "-8px 8px 0 0 #1E1611",
        floating: "-8px 8px 0 0 #1E1611",
        "hard-xs": "-2px 2px 0 0 #1E1611",
        "hard-sm": "-3px 3px 0 0 #1E1611",
        hard: "-6px 6px 0 0 #1E1611",
        "hard-lg": "-10px 10px 0 0 #1E1611",
        "hard-xl": "-14px 14px 0 0 #1E1611",
        "hard-honey": "-6px 6px 0 0 #DFA03F",
        "hard-honey-lg": "-10px 10px 0 0 #DFA03F",
        "hard-red": "-6px 6px 0 0 #B8273A",
        "hard-pistachio": "-6px 6px 0 0 #4E6534",
        "hard-cream": "-6px 6px 0 0 #F6EEDF",
        "hard-cocoa": "-6px 6px 0 0 #2E2018",
      },
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        float: {
          "0%,100%": { transform: "translateY(0) rotate(var(--r,0deg))" },
          "50%": { transform: "translateY(-12px) rotate(var(--r,0deg))" },
        },
        drip: {
          "0%": { transform: "scaleY(0.2)", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 24s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      transitionDuration: {
        hover: "150ms",
        press: "100ms",
        fade: "200ms",
        slide: "250ms",
      },
      zIndex: {
        base: "0",
        sticky: "10",
        dropdown: "20",
        drawer: "30",
        modalBackdrop: "40",
        modal: "50",
        toast: "60",
      },
    },
  },
  plugins: [],
};

export default config;
