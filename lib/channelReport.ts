// Mirrors lib/crmReport.ts's option/color setup, for the "پیام به کانال‌ها"
// section — pages/channels the team reaches out to, instead of phone
// numbers they call. Kept as its own file (rather than folded into
// crmReport.ts) since the two pipelines have separate status vocabularies;
// the Tehran-day helpers are reused from crmReport.ts instead of
// duplicated.

export type ChannelResultOption = { label: string; colorClass: string };

export const CHANNEL_RESULT_OPTIONS: ChannelResultOption[] = [
  { label: "پیام داده شد", colorClass: "border-sky-500/40 bg-sky-500/15 text-sky-600" },
  { label: "قبول کرد", colorClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-600" },
  { label: "قبول نکرد", colorClass: "border-red-500/40 bg-red-500/15 text-red-500" },
];

/** The channel hasn't been messaged yet — styled like CRM_NOT_CALLED_OPTION
 *  so it can sit alongside the outcomes above in the status dropdown and
 *  the filter tabs. */
export const CHANNEL_NOT_MESSAGED_OPTION: ChannelResultOption = {
  label: "پیام داده نشده",
  colorClass: "border-gray-400/40 bg-gray-400/15 text-gray-500",
};

/** Tailwind classes for a given result label, falling back to the
 *  not-messaged color for anything not in the fixed list. */
export function getChannelResultColorClass(result: string): string {
  return (
    CHANNEL_RESULT_OPTIONS.find((o) => o.label === result)?.colorClass || CHANNEL_NOT_MESSAGED_OPTION.colorClass
  );
}
