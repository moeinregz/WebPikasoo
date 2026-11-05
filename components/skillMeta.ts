// نگاشت هر مهارت به رنگ برند اصلیش + اسلاگ لوگو (سرویس simpleicons.org).
// اگه اسلاگ موجود نباشه یا لود لوگو fail بشه، SkillCard خودش یه مونوگرام
// رنگی (حرف اول اسم) رو به‌عنوان جایگزین نشون می‌ده — پس هر آیتم همیشه
// رنگ برندش رو داره، حتی وقتی لوگوی دقیقی براش نداریم.

export type SkillMeta = {
  slug?: string; // slug روی cdn.simpleicons.org — https://cdn.simpleicons.org/<slug>
  color: string; // رنگ اصلی برند، برای بک‌گراند/بردر/گلو استفاده می‌شه
  mono?: string; // متن جایگزین وقتی لوگو نداریم (پیش‌فرض: حرف اول اسم)
};

export const SKILL_META: Record<string, SkillMeta> = {
  React: { slug: "react", color: "#61DAFB" },
  "Next.js": { slug: "nextdotjs", color: "#2F81F7" },

  "Node.js": { slug: "nodedotjs", color: "#339933" },
  MongoDB: { slug: "mongodb", color: "#47A248" },
  "C#": { slug: "dotnet", color: "#512BD4", mono: "C#" },
  PostgreSQL: { slug: "postgresql", color: "#4169E1" },
  FastAPI: { slug: "fastapi", color: "#009688" },
  PHP: { slug: "php", color: "#8892BF" },
  Go: { slug: "go", color: "#00ADD8" },
  SQLite: { slug: "sqlite", color: "#4E9CBF" },

  WordPress: { slug: "wordpress", color: "#3499CD" },
  Elementor: { slug: "elementor", color: "#F04747" },
  WooCommerce: { slug: "woocommerce", color: "#9B5C8F" },
  WoodMart: { color: "#D97A3D", mono: "W" },

  Python: { slug: "python", color: "#3776AB" },
  PyTorch: { slug: "pytorch", color: "#EE4C2C" },
  TensorFlow: { slug: "tensorflow", color: "#FF6F00" },
  "Scikit-learn": { slug: "scikitlearn", color: "#F7931E" },
  Ultralytics: { color: "#0BDA8E", mono: "U" },
  NumPy: { slug: "numpy", color: "#4DABCF" },

  // ابزارهای بخش ToolsFinder — اگه بعداً به کارت تبدیل شدن آماده‌ست
  TypeScript: { slug: "typescript", color: "#3178C6" },
  "Tailwind CSS": { slug: "tailwindcss", color: "#38BDF8" },
  "Express.js": { slug: "express", color: "#8A8A8A" },
  "ASP.NET": { slug: "dotnet", color: "#512BD4" },
  Blazor: { slug: "blazor", color: "#512BD4" },
  Axios: { slug: "axios", color: "#5A29E4" },
  "SQL Server": { slug: "microsoftsqlserver", color: "#CC2927" },
  Redis: { slug: "redis", color: "#DC382D" },
  Docker: { slug: "docker", color: "#2496ED" },
  "Git & GitHub": { slug: "git", color: "#F05032" },
  N8N: { slug: "n8n", color: "#EA4B71" },
};

export const DEFAULT_SKILL_COLOR = "#0077B6";
