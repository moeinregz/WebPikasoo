// Server-only. When a CRM lead is accepted ("قبول برای دیدن") and an admin /
// developer confirms, this builds a demo site from the lead's data with a
// random template and drops name + link into the team chat.
import { headers } from "next/headers";
import { sendTeamMessage, setChannelLeadSite, setCrmLeadSite, type ChannelLead, type CrmLead } from "@/lib/db";
import { detectTrades } from "@/lib/siteTemplates/crmMapping";
import { imageSlotsFor, pickTemplateAmong } from "@/lib/siteTemplates";
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

type SiteSource = {
  name: string;
  businessType: string;
  phones: string[];
  address?: string;
  instagram?: string;
  whatsapp?: string;
  existingToken?: string;
  /** Shown in the private site's note, e.g. «CRM» / «کانال‌ها». */
  sourceLabel: string;
  saveToken: (token: string) => Promise<void>;
};

/** Shared by the CRM and the channels tab. Never throws: the status has
 *  already been saved by the caller, and a site-building hiccup must not undo
 *  that — it is reported in the team chat instead. */
async function buildSiteAndPost(src: SiteSource, userId: number): Promise<void> {
  try {
    // One site per lead/channel: accepting again just re-posts the existing link.
    if (src.existingToken) {
      await sendTeamMessage({
        userId,
        message: `${src.name}\n${siteOrigin()}/preview/${src.existingToken}\n(سایت قبلاً برای این کسب‌وکار ساخته شده بود)`,
      });
      return;
    }

    const guess = detectTrades(src.name, src.businessType);
    const template = pickTemplateAmong(guess.tradeIds);
    if (!template && guess.tradeIds.length > 0) {
      await sendTeamMessage({ userId, message: `⚠️ ${src.name}\nسایت خودکار ساخته نشد: برای این صنف هنوز قالبی اضافه نشده.` });
      return;
    }
    if (!template) {
      await sendTeamMessage({
        userId,
        message: `⚠️ ${src.name}\nسایت خودکار ساخته نشد: صنف کاری مشخص نیست. نوع کسب‌وکار را تکمیل کنید.`,
      });
      return;
    }
    const phones = src.phones.filter(Boolean).slice(0, 3);
    if (!phones.length) {
      await sendTeamMessage({
        userId,
        message: `⚠️ ${src.name}\nسایت خودکار ساخته نشد: شماره تماس ثبت نشده. اطلاعاتش رو تکمیل کنید و دوباره «قبول» بزنید.`,
      });
      return;
    }

    const instagram = src.instagram && normalizeInstagram(src.instagram) ? src.instagram : undefined;
    const whatsapp = src.whatsapp && whatsappNumber(src.whatsapp) ? src.whatsapp : undefined;

    const { site } = await buildPrivateSite({
      template,
      input: { brand: src.name, address: src.address || "—", phones, instagram, whatsapp },
      note: `ساخته‌شده‌ی خودکار از ${src.sourceLabel} — قالب «${template.label}»`,
    });

    await src.saveToken(site.token);
    const needsPhotos = imageSlotsFor(template.id).length > 0;
    await sendTeamMessage({
      userId,
      message:
        `${src.name}\n${siteOrigin()}/preview/${site.token}` +
        (needsPhotos ? "\n📷 این قالب جای عکس داره؛ از تب «سایت‌های خصوصی» عکس‌هاش رو آپلود کنید." : ""),
    });
  } catch (err) {
    console.error("buildSiteAndPost failed:", err);
    try {
      await sendTeamMessage({
        userId,
        message: `⚠️ ${src.name}\nساخت خودکار سایت ناموفق بود. از تب «ساخت سایت از قالب» دستی بسازید.`,
      });
    } catch {
      // chat itself failing is not worth masking the original error
    }
  }
}

export async function autoBuildSiteForLead(lead: CrmLead, userId: number): Promise<void> {
  await buildSiteAndPost(
    {
      name: lead.name,
      businessType: lead.business_type,
      phones: [lead.phone, ...(lead.extra_phones ?? [])],
      address: lead.business_area,
      instagram: lead.instagram,
      whatsapp: lead.whatsapp,
      existingToken: lead.site_token,
      sourceLabel: "CRM",
      saveToken: (t) => setCrmLeadSite(lead.id, t),
    },
    userId
  );
}

/** A page/channel accepted («قبول کرد»). Its page id is used as Instagram
 *  when it looks like a handle / instagram link. */
export async function autoBuildSiteForChannel(channel: ChannelLead, userId: number): Promise<void> {
  const page = (channel.page_name || "").trim();
  const looksLikeInstagram = /instagram\.com\//i.test(page) || /^@?[A-Za-z0-9._]{2,30}$/.test(page);
  await buildSiteAndPost(
    {
      name: channel.business_name || page,
      businessType: channel.business_type || "",
      phones: [channel.phone || ""],
      address: channel.address,
      instagram: looksLikeInstagram ? page : undefined,
      existingToken: channel.site_token,
      sourceLabel: "کانال‌ها",
      saveToken: (t) => setChannelLeadSite(channel.id, t),
    },
    userId
  );
}
