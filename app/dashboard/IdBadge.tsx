import { toPersianDigits } from "@/lib/auth";

export default function IdBadge({ id }: { id: number }) {
  return (
    <span className="inline-flex items-center rounded-md border border-ink/[0.16] bg-canvas px-2 py-0.5 font-mono text-[11px] text-dim">
      #{toPersianDigits(id)}
    </span>
  );
}
