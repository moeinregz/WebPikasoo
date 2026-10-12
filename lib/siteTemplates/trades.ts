// Client-safe: only metadata (no template HTML) so the dashboard form can
// import it without pulling every template into the browser bundle.

export type ColorRole = "primary" | "secondary" | "accent" | "bg" | "text";
export type RoleColors = Record<ColorRole, string>;

export type Trade = {
  id: string;
  label: string;
  /** Used whenever the admin doesn't pick a color — e.g. a café with no
   *  color given gets its warm coffee/nescafé browns. */
  colors: RoleColors;
};

export const TRADES: Trade[] = [
  { id: "cafe", label: "کافه", colors: { primary: "#6F4E37", secondary: "#C8A27A", accent: "#D9822B", bg: "#F5ECE0", text: "#2B1D14" } },
  { id: "restaurant", label: "رستوران", colors: { primary: "#8B1E2D", secondary: "#D4A857", accent: "#C0392B", bg: "#FBF6EE", text: "#2A1A17" } },
  { id: "fastfood", label: "فست‌فود", colors: { primary: "#E63B1F", secondary: "#FFC72C", accent: "#FF8A00", bg: "#FFF8EC", text: "#231A14" } },
  { id: "bakery", label: "نانوایی و شیرینی", colors: { primary: "#C17F2B", secondary: "#E8CD8A", accent: "#D6491C", bg: "#F6EFE0", text: "#2B1810" } },
  { id: "gym", label: "باشگاه ورزشی", colors: { primary: "#E4572E", secondary: "#1F2933", accent: "#F2B134", bg: "#0F141A", text: "#F3F4F6" } },
  { id: "dental", label: "دندانپزشکی", colors: { primary: "#1F8FBF", secondary: "#7FC8E8", accent: "#2BB5A0", bg: "#F4FAFD", text: "#12303F" } },
  { id: "clinic", label: "کلینیک", colors: { primary: "#2A9D8F", secondary: "#8ED1C6", accent: "#1F6F8B", bg: "#F3FAF9", text: "#143A36" } },
  { id: "shop", label: "فروشگاه", colors: { primary: "#2F4BD1", secondary: "#9AA9F0", accent: "#F2994A", bg: "#F7F8FD", text: "#171B33" } },
  { id: "law", label: "دفتر وکالت", colors: { primary: "#1E2A47", secondary: "#B8975A", accent: "#8C6D2F", bg: "#F6F4EF", text: "#171B2A" } },
  { id: "hotel", label: "هتل و اقامتگاه", colors: { primary: "#14532D", secondary: "#C8B273", accent: "#A67C37", bg: "#FAF8F1", text: "#1B2A20" } },
];

export function getTrade(id: string): Trade | undefined {
  return TRADES.find((t) => t.id === id);
}
