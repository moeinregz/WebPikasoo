"use client";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 20; // سقف منطقی UI؛ هیچ محدودیت خرید واقعی طبق Blueprint وجود ندارد

export function QuantitySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  function clamp(n: number) {
    if (Number.isNaN(n)) return MIN_QUANTITY;
    return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(n)));
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-label text-text-secondary">تعداد</span>
      <div className="flex h-11 items-center rounded-md border border-border-strong">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= MIN_QUANTITY}
          aria-label="کاهش تعداد"
          className="flex h-full w-10 items-center justify-center text-text-secondary disabled:opacity-30"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          aria-label="تعداد سفارش"
          className="h-full w-12 border-x border-border-strong bg-transparent text-center text-bodySm text-text-primary focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= MAX_QUANTITY}
          aria-label="افزایش تعداد"
          className="flex h-full w-10 items-center justify-center text-text-secondary disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
