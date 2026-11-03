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
  { id: "kebab", label: "کبابی و کباب‌سرا", colors: { primary: "#C8102E", secondary: "#2A1233", accent: "#F2B632", bg: "#FFF5E6", text: "#1D1020" } },
  { id: "garden", label: "باغ رستوران", colors: { primary: "#1F3D2B", secondary: "#F2A63B", accent: "#D8294B", bg: "#F6ECD6", text: "#2A1C10" } },
  { id: "fastfood", label: "فست‌فود", colors: { primary: "#E63B1F", secondary: "#FFC72C", accent: "#FF8A00", bg: "#FFF8EC", text: "#231A14" } },
  { id: "bakery", label: "نانوایی", colors: { primary: "#C17F2B", secondary: "#E8CD8A", accent: "#D6491C", bg: "#F6EFE0", text: "#2B1810" } },
  { id: "pastry", label: "شیرینی‌فروشی", colors: { primary: "#C6942F", secondary: "#4A2020", accent: "#77875A", bg: "#FBF2E3", text: "#3A2418" } },
  { id: "icecream", label: "بستنی و آبمیوه‌فروشی", colors: { primary: "#FF4D6D", secondary: "#FF8A3D", accent: "#FFCB3C", bg: "#FFF6E8", text: "#3A1730" } },
  { id: "shop", label: "فروشگاه", colors: { primary: "#2F4BD1", secondary: "#9AA9F0", accent: "#F2994A", bg: "#F7F8FD", text: "#171B33" } },
  { id: "fashion", label: "لباس‌فروشی مردانه و بوتیک", colors: { primary: "#1E5B3F", secondary: "#C6A35F", accent: "#0F3B27", bg: "#F5F1E4", text: "#0B0F0C" } },
  { id: "jewelry", label: "طلافروشی و جواهر", colors: { primary: "#C9A13B", secondary: "#2A1014", accent: "#F2D98A", bg: "#120D09", text: "#F3EAD4" } },
  { id: "watch", label: "ساعت‌فروشی", colors: { primary: "#C9A24B", secondary: "#7A2E3A", accent: "#E6C877", bg: "#0B0C0F", text: "#EFE9DB" } },
  { id: "carpet", label: "فرش‌فروشی", colors: { primary: "#6E1423", secondary: "#C39A4B", accent: "#E1B866", bg: "#F6EFE6", text: "#2A1418" } },
  { id: "cosmetics", label: "لوازم آرایشی", colors: { primary: "#C6455B", secondary: "#C9A15A", accent: "#9E2F44", bg: "#FFF9F5", text: "#2B0F14" } },
  { id: "womenswear", label: "مزون و پوشاک زنانه", colors: { primary: "#B76E79", secondary: "#7D3C47", accent: "#E8C4BD", bg: "#F6F0E8", text: "#1B1717" } },
  { id: "shoes", label: "کیف و کفش فروشی", colors: { primary: "#FF5B1F", secondary: "#111111", accent: "#C6F432", bg: "#F3F1EC", text: "#111111" } },
  { id: "stationery", label: "لوازم‌التحریر", colors: { primary: "#4C6EF5", secondary: "#FF8FAB", accent: "#FFD43B", bg: "#FFFBF2", text: "#2B2A33" } },
  { id: "tools", label: "ابزارآلات و یراق", colors: { primary: "#FFC400", secondary: "#2E2E2E", accent: "#FFC400", bg: "#121212", text: "#F2F2F2" } },
  { id: "autoparts", label: "لوازم یدکی خودرو", colors: { primary: "#E10600", secondary: "#1B263B", accent: "#7DD3FC", bg: "#0B1220", text: "#E8EEF6" } },
  { id: "accessories", label: "اکسسوری و بدلیجات", colors: { primary: "#D9466F", secondary: "#2B2D42", accent: "#F4C95D", bg: "#FFF7F3", text: "#1F1A24" } },
  { id: "bookstore", label: "کتاب‌فروشی", colors: { primary: "#1F4D3A", secondary: "#B8862F", accent: "#8C2F39", bg: "#F3EBDD", text: "#1E1A16" } },
  { id: "perfume", label: "عطر و ادکلن فروشی", colors: { primary: "#C9A25A", secondary: "#5B1F3A", accent: "#E8D3A2", bg: "#0C0A0B", text: "#F3EAD9" } },
  { id: "dental", label: "دندانپزشکی", colors: { primary: "#1F8FBF", secondary: "#7FC8E8", accent: "#2BB5A0", bg: "#F4FAFD", text: "#12303F" } },
  { id: "clinic", label: "کلینیک", colors: { primary: "#2A9D8F", secondary: "#8ED1C6", accent: "#1F6F8B", bg: "#F3FAF9", text: "#143A36" } },
  { id: "gym", label: "باشگاه ورزشی", colors: { primary: "#E4572E", secondary: "#1F2933", accent: "#F2B134", bg: "#0F141A", text: "#F3F4F6" } },
  { id: "upholstery", label: "مبل‌شویی", colors: { primary: "#0A2540", secondary: "#C9A227", accent: "#2BB5A0", bg: "#F3ECDC", text: "#0D1420" } },
  { id: "moving", label: "باربری و حمل‌ونقل", colors: { primary: "#FFC530", secondary: "#FF5A2A", accent: "#57666F", bg: "#F1ECDF", text: "#1B1811" } },
  { id: "realestate", label: "مشاور املاک", colors: { primary: "#155C42", secondary: "#C9A227", accent: "#E4C97A", bg: "#FAF7EF", text: "#12140F" } },
  { id: "law", label: "دفتر وکالت", colors: { primary: "#1E2A47", secondary: "#B8975A", accent: "#8C6D2F", bg: "#F6F4EF", text: "#171B2A" } },
  { id: "language", label: "آموزشگاه زبان", colors: { primary: "#E8A33D", secondary: "#1B2A4A", accent: "#C1443C", bg: "#F7F3E8", text: "#28241D" } },
  { id: "music", label: "آموزشگاه موسیقی", colors: { primary: "#742642", secondary: "#CF9C4F", accent: "#9C3A56", bg: "#FAF5E8", text: "#2A1710" } },
  { id: "travel", label: "آژانس مسافرتی و تور", colors: { primary: "#1B4A66", secondary: "#E3A857", accent: "#2C8DB8", bg: "#F3F7FA", text: "#12303F" } },
  { id: "hotel", label: "هتل و اقامتگاه", colors: { primary: "#14532D", secondary: "#C8B273", accent: "#A67C37", bg: "#FAF8F1", text: "#1B2A20" } },
];

export function getTrade(id: string): Trade | undefined {
  return TRADES.find((t) => t.id === id);
}
