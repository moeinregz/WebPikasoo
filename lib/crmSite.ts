// Server-only. When a CRM lead is accepted ("قبول برای دیدن") and an admin /
// developer confirms, this builds a demo site from the lead's data with a
// random template and drops name + link into the team chat.
import { headers } from "next/headers";
import { sendTeamMessage, setCrmLeadSite, type CrmLead } from "@/lib/db";
import { detectTrades } from "@/lib/siteTemplates/crmMapping";
import { pickTemplateAmong } from "@/lib/siteTemplates";
import { normalizeInstagram, whatsappNumber } from "@/lib/siteTemplates/generate";
import { buildPrivateSite } from "@/lib/siteTemplates/publish";

function siteOrigin(): string {
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // not inside a request — fall through to the configured URL
  }
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://webpikaso.ir").replace(/\/$/, "");
}

/** Never throws: the lead's status has already been saved by the caller, and
 *  a site-building hiccup must not undo that — it is reported in the chat. */
export async function autoBuildSiteForLead(lead: CrmLead, userId: number): Promise<void> {
  try {
    // One site per lead: accepting again just re-posts the existing link.
    if (lead.site_token) {
      await sendTeamMessage({
        userId,
        message: `${lead.name}\n${siteOrigin()}/preview/${lead.site_token}\n(سایت قبلاً برای این کسب‌وکار ساخته شده بود)`,
      });
      return;
    }

    const guess = detectTrades(lead.name, lead.business_type);
    const template = pickTemplateAmong(guess.tradeIds);
    if (!template) {
      await sendTeamMessage({
        userId,
        message: `⚠️ ${lead.name}\nسایت خودکار ساخته نشد: صنف کاری مشخص نیست. نوع کسب‌وکار لید را تکمیل کنید.`,
      });
      return;
    }

    const phones = [lead.phone, ...(lead.extra_phones ?? [])].filter(Boolean).slice(0, 3);
    const instagram = lead.instagram && normalizeInstagram(lead.instagram) ? lead.instagram : undefined;
    const whatsapp = lead.whatsapp && whatsappNumber(lead.whatsapp) ? lead.whatsapp : undefined;

    const { site } = await buildPrivateSite({
      template,
      input: {
        brand: lead.name,
        address: lead.business_area || "—",
        phones,
        instagram,
        whatsapp,
      },
      note: `ساخته‌شده‌ی خودکار از CRM — قالب «${template.label}»`,
    });

    await setCrmLeadSite(lead.id, site.token);
    await sendTeamMessage({ userId, message: `${lead.name}\n${siteOrigin()}/preview/${site.token}` });
  } catch (err) {
    console.error("autoBuildSiteForLead failed:", err);
    try {
      await sendTeamMessage({
        userId,
        message: `⚠️ ${lead.name}\nساخت خودکار سایت ناموفق بود. از تب «ساخت سایت از قالب» دستی بسازید.`,
      });
    } catch {
      // chat itself failing is not worth masking the original error
    }
  }
}
