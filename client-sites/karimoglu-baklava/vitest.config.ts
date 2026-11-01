import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    env: {
      NODE_ENV: "test",
    },
    // همه فایل‌های تست به یک دیتابیس PostgreSQL (TEST_DATABASE_URL) وصل می‌شوند؛ پس
    // باید پشت سر هم اجرا شوند تا Reset یک فایل، داده فایل دیگر را پاک نکند.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
