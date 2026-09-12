/** نوار CTA ثابت پایین صفحه، فقط تو موبایل — همیشه در دسترس، مستقل از
 *  این‌که کاربر کجای صفحه اسکرول کرده. لینک به فرم مشاوره‌ی رایگان تو
 *  صفحه‌ی اصلی می‌ره؛ چون از هر صفحه‌ای قابل مشاهده‌ست، مسیر مطلق (/#lead-form)
 *  به‌جای anchor نسبی استفاده شده. */
export default function MobileStickyCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-ink/10 bg-canvas/90 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-xl sm:hidden"
      role="complementary"
      aria-label="دسترسی سریع به مشاوره رایگان"
    >
      <a
        href="/#lead-form"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[14.5px] font-bold text-white shadow-glow"
      >
        مشاوره رایگان
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </div>
  );
}
