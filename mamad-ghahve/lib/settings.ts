import "server-only";
import { db } from "./db";

export type Settings = Record<string, string>;

export function getSettings(): Settings {
  const rows = db().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const out: Settings = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export function getSetting(key: string, fallback = ""): string {
  const r = db().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return r?.value ?? fallback;
}

export function setSettings(values: Settings) {
  const st = db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  const tx = db().transaction((v: Settings) => {
    for (const [k, val] of Object.entries(v)) st.run(k, val);
  });
  tx(values);
}

export function num(s: Settings, key: string, fallback = 0): number {
  const n = Number(s[key]);
  return Number.isFinite(n) ? n : fallback;
}

export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
