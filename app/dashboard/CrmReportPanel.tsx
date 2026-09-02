"use client";

import { useMemo, useState } from "react";
import { toPersianDigits } from "@/lib/auth";
import { tehranDayKey, todayTehranKey, formatTehranDayKey } from "@/lib/crmReport";

type Lead = {
  id: number;
  name: string;
  phone: string;
  created_at: string;
  created_by: number | null;
};

type CallLog = {
  id: number;
  lead_id: number;
  user_id: number;
  result: string;
  created_at: string;
};

type Channel = {
  id: number;
  page_name: string;
  business_name: string;
  created_at: string;
  created_by: number | null;
};

type ChannelMessageLog = {
  id: number;
  channel_id: number;
  user_id: number;
  result: string;
  created_at: string;
};

type TeamMember = { id: number; name: string };

/** The one daily activity report, covering both CRM calls and channel
 *  messages side by side per team member — channels/channelMessages are
 *  optional so this still works if a caller only has CRM data. */
export default function CrmReportPanel({
  leads,
  calls,
  channels = [],
  channelMessages = [],
  users,
}: {
  leads: Lead[];
  calls: CallLog[];
  channels?: Channel[];
  channelMessages?: ChannelMessageLog[];
  users: TeamMember[];
}) {
  const [date, setDate] = useState(todayTehranKey());

  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const channelById = useMemo(() => new Map(channels.map((c) => [c.id, c])), [channels]);

  const rows = useMemo(() => {
    const leadsForDay = leads.filter((l) => tehranDayKey(l.created_at) === date);
    const callsForDay = calls.filter((c) => tehranDayKey(c.created_at) === date);
    const channelsForDay = channels.filter((c) => tehranDayKey(c.created_at) === date);
    const messagesForDay = channelMessages.filter((m) => tehranDayKey(m.created_at) === date);

    return users
      .map((u) => {
        const userLeads = leadsForDay.filter((l) => l.created_by === u.id);
        const userCalls = callsForDay
          .filter((c) => c.user_id === u.id)
          .map((c) => ({
            ...c,
            leadName: leadById.get(c.lead_id)?.name ?? "لید حذف‌شده",
            leadPhone: leadById.get(c.lead_id)?.phone ?? "",
          }))
          // Newest call first within the day.
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

        const userChannels = channelsForDay.filter((c) => c.created_by === u.id);
        const userMessages = messagesForDay
          .filter((m) => m.user_id === u.id)
          .map((m) => ({
            ...m,
            pageName: channelById.get(m.channel_id)?.page_name ?? "کانال حذف‌شده",
            businessName: channelById.get(m.channel_id)?.business_name ?? "",
          }))
          // Newest message first within the day.
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

        return {
          user: u,
          leadsCreated: userLeads.length,
          callsMade: userCalls.length,
          calls: userCalls,
          channelsAdded: userChannels.length,
          messagesSent: userMessages.length,
          messages: userMessages,
        };
      })
      // Busiest people first; anyone with zero activity sinks to the bottom
      // but still shows up, so it's obvious at a glance who did nothing.
      .sort(
        (a, b) =>
          b.leadsCreated + b.callsMade + b.channelsAdded + b.messagesSent -
          (a.leadsCreated + a.callsMade + a.channelsAdded + a.messagesSent)
      );
  }, [leads, calls, channels, channelMessages, users, date, leadById, channelById]);

  const totalLeads = rows.reduce((sum, r) => sum + r.leadsCreated, 0);
  const totalCalls = rows.reduce((sum, r) => sum + r.callsMade, 0);
  const totalChannels = rows.reduce((sum, r) => sum + r.channelsAdded, 0);
  const totalMessages = rows.reduce((sum, r) => sum + r.messagesSent, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-card border border-ink/[0.14] bg-surface/20 p-5">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-semibold text-dim">تاریخ گزارش</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-2.5 text-[14px] text-ink outline-none transition focus:border-accent"
          />
          <p className="mt-1.5 text-[12px] text-dim">{formatTehranDayKey(date)}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-[13px] text-dim">
          <span>
            شماره‌ی ثبت‌شده: <b className="text-ink">{toPersianDigits(totalLeads)}</b>
          </span>
          <span>
            زنگ زده‌شده: <b className="text-ink">{toPersianDigits(totalCalls)}</b>
          </span>
          <span>
            پیج/کانال ثبت‌شده: <b className="text-ink">{toPersianDigits(totalChannels)}</b>
          </span>
          <span>
            پیام داده‌شده: <b className="text-ink">{toPersianDigits(totalMessages)}</b>
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 text-center text-dim">
          هیچ عضو تیمی برای نمایش گزارش نیست.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((r) => (
            <div key={r.user.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-normal">{r.user.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-ink/[0.16] px-3 py-1 font-mono text-[11.5px] text-dim">
                    {toPersianDigits(r.leadsCreated)} شماره ثبت کرد
                  </span>
                  <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[11.5px] text-accent">
                    {toPersianDigits(r.callsMade)} تماس گرفت
                  </span>
                  <span className="rounded-full border border-ink/[0.16] px-3 py-1 font-mono text-[11.5px] text-dim">
                    {toPersianDigits(r.channelsAdded)} پیج/کانال ثبت کرد
                  </span>
                  <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 font-mono text-[11.5px] text-sky-600">
                    {toPersianDigits(r.messagesSent)} پیام داد
                  </span>
                </div>
              </div>

              {r.calls.length === 0 && r.messages.length === 0 ? (
                <p className="text-[13px] text-dim/70">این روز تماس یا پیامی ثبت نکرده.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 font-mono text-[11.5px] text-dim/70">تماس‌های CRM</p>
                    {r.calls.length === 0 ? (
                      <p className="text-[13px] text-dim/70">این روز تماسی ثبت نکرده.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {r.calls.map((c) => (
                          <li
                            key={c.id}
                            className="flex flex-col gap-0.5 rounded-lg border border-ink/[0.1] bg-canvas/60 px-3.5 py-2.5 text-[13px]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold">{c.leadName}</span>
                              <span className="font-mono text-[11.5px] text-dim" dir="ltr">
                                {toPersianDigits(c.leadPhone)}
                              </span>
                            </div>
                            <p className="text-dim">نتیجه: {c.result || "ثبت نشده"}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="mb-1.5 font-mono text-[11.5px] text-dim/70">پیام‌های کانال</p>
                    {r.messages.length === 0 ? (
                      <p className="text-[13px] text-dim/70">این روز پیامی ثبت نکرده.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {r.messages.map((m) => (
                          <li
                            key={m.id}
                            className="flex flex-col gap-0.5 rounded-lg border border-ink/[0.1] bg-canvas/60 px-3.5 py-2.5 text-[13px]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold">{m.pageName}</span>
                              <span className="font-mono text-[11.5px] text-dim">{m.businessName}</span>
                            </div>
                            <p className="text-dim">نتیجه: {m.result || "ثبت نشده"}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
