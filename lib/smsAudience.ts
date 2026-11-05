// Server-only: everyone the SMS panel can text — CRM leads and channel leads
// whose number is a mobile (09…), with their trade, group and status so the
// panel can filter and group them. Landlines are left out (they can't get SMS).
import { getAllChannelLeads, getAllCrmLeads, getLastSmsByPhone, getSmsOptOuts } from "@/lib/db";
import { detectTrades } from "@/lib/siteTemplates/crmMapping";
import { TRADES } from "@/lib/siteTemplates/trades";
import { CRM_NOT_CALLED_OPTION } from "@/lib/crmReport";
import { groupOfTrade, toMobile } from "@/lib/smsText";

export type SmsContact = {
  /** unique per phone */
  phone: string;
  source: "crm" | "channel";
  leadId: number;
  name: string;
  tradeId: string | null;
  tradeLabel: string;
  group: string;
  /** last call / message result */
  status: string;
  problem: string;
  area: string;
  lastSmsAt: string | null;
  optedOut: boolean;
};

const UNKNOWN = "نامشخص";

function tradeOf(name: string, businessType: string): { tradeId: string | null; tradeLabel: string; group: string } {
  const guess = detectTrades(name, businessType);
  if (guess.tradeIds.length === 1) {
    const t = TRADES.find((x) => x.id === guess.tradeIds[0]);
    return { tradeId: guess.tradeIds[0], tradeLabel: t?.label ?? guess.tradeIds[0], group: groupOfTrade(guess.tradeIds[0]) ?? UNKNOWN };
  }
  // an old broad category: keep it as the label so it is still filterable
  return { tradeId: null, tradeLabel: businessType || UNKNOWN, group: businessType || UNKNOWN };
}

export async function getSmsAudience(): Promise<SmsContact[]> {
  const [crm, channels, lastSms, optOuts] = await Promise.all([getAllCrmLeads(), getAllChannelLeads(), getLastSmsByPhone(), getSmsOptOuts()]);
  const opted = new Set(optOuts);
  const byPhone = new Map<string, SmsContact>();

  for (const l of crm) {
    const phones = [l.phone, ...(l.extra_phones ?? [])].map(toMobile).filter((p): p is string => !!p);
    for (const phone of phones) {
      if (byPhone.has(phone)) continue;
      byPhone.set(phone, {
        phone,
        source: "crm",
        leadId: l.id,
        name: l.name,
        ...tradeOf(l.name, l.business_type),
        status: l.called ? l.last_call_result || "تماس گرفته شد" : CRM_NOT_CALLED_OPTION.label,
        problem: l.problem_status || "",
        area: l.business_area || "",
        lastSmsAt: lastSms[phone] ?? null,
        optedOut: opted.has(phone),
      });
    }
  }
  for (const c of channels) {
    const phone = toMobile(c.phone);
    if (!phone || byPhone.has(phone)) continue;
    const name = c.business_name || c.page_name;
    byPhone.set(phone, {
      phone,
      source: "channel",
      leadId: c.id,
      name,
      ...tradeOf(name, c.business_type ?? ""),
      status: c.messaged ? c.last_message_result || "پیام داده شد" : "پیام نداده",
      problem: "",
      area: c.address || "",
      lastSmsAt: lastSms[phone] ?? null,
      optedOut: opted.has(phone),
    });
  }
  return Array.from(byPhone.values());
}
