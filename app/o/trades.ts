import { TEMPLATES } from "@/lib/siteTemplates";
import { TRADES } from "@/lib/siteTemplates/trades";

/** Trades that have a demo template, in the order the switcher shows them. */
export function offerTrades(): { id: string; label: string; color: string }[] {
  const has = new Set(TEMPLATES.map((t) => t.trade));
  return TRADES.filter((t) => has.has(t.id)).map((t) => ({ id: t.id, label: t.label, color: t.colors.primary }));
}
