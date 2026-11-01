# ===== Dockerfile — «باقلوا کریم اغلو» =====
#
# دیتابیس: PostgreSQL (خارج از Container). آدرس اتصال از متغیر محیطی
# `DATABASE_URL` در زمان اجرا خوانده می‌شود؛ هیچ داده‌ای (حتی عکس‌های آپلودشده)
# داخل Container نگه داشته نمی‌شود — همه‌چیز در PostgreSQL است.
#
# نسخه Node ثابت (Pin) شده است؛ قبل از Production آن را با نسخه‌ای که
# `npm test` روی آن اجرا شده هماهنگ کنید.

# ---------- مرحله ۱: نصب Dependencies ----------
FROM node:24.7.0-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# --omit=dev چون این مرحله فقط برای Build است؛ dependencies توسعه در مرحله
# builder جدا نصب می‌شوند (npm ci بدون --omit روی همین لایه، برای Cache بهتر)
RUN npm ci

# ---------- مرحله ۲: Build ----------
FROM node:24.7.0-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# مسیر دیتابیس یا Secret واقعی اینجا لازم نیست — Build فقط کد را کامپایل
# می‌کند، به دیتابیس واقعی وصل نمی‌شود
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone
RUN npm run build

# ---------- مرحله ۳: Runtime نهایی (کوچک، بدون ابزار Build) ----------
FROM node:24.7.0-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# کاربر غیر-root — طبق الزام صریح Hardening (بخش ۲۰ Prompt)
RUN groupadd --system --gid 1001 karimoglu && \
    useradd --system --uid 1001 --gid karimoglu nextjs

# فقط خروجی Standalone (کوچک‌ترین مجموعه فایل لازم — رجوع به next.config.js:
# output: "standalone") + استاتیک‌ها + Public کپی می‌شوند؛ کل node_modules
# منبع/Dev در Image نهایی وجود ندارد.
COPY --from=builder --chown=nextjs:karimoglu /app/.next/standalone ./
COPY --from=builder --chown=nextjs:karimoglu /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:karimoglu /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health Check سطح Docker — از همان Endpoint واقعی که در app/api/health
# ساخته شده استفاده می‌کند (بخش ۲۲ Prompt). اگر این Health Check چند بار
# پیاپی شکست بخورد، Orchestrator (Docker/Compose/Swarm/K8s) Container را
# Unhealthy علامت می‌زند.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
