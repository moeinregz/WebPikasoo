// Shared by page.tsx (server) and the client search panels — plain functions
// with no server-only APIs, so safe to import from either side.

export function formatDateTime(iso: string) {
  // Stored as UTC "YYYY-MM-DD HH:MM:SS" from SQLite's datetime('now').
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
}
