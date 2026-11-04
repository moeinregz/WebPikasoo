"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toFa } from "@/lib/fa";
import { AREAS, EVENT_TYPES, SITE, TIMES, waLink } from "@/lib/site";
import { SectionHead } from "./Ornaments";

type Status = "idle" | "sending" | "done" | "error";

export default function Reserve() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<{ id: number; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus("sending");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        setErrors(json.errors ?? {});
        setMessage(json.error ?? "لطفاً موارد مشخص‌شده را اصلاح کنید.");
        setStatus("error");
        return;
      }
      const text =
        `سلام، درخواست رزرو در سایت ثبت کردم (کد ${json.id}).\n` +
        `نام: ${data.name}\nمراسم: ${data.event_type}\nتعداد: ${data.guests} نفر\n` +
        `تاریخ: ${data.date_text}${data.time_text ? " — " + data.time_text : ""}` +
        (data.area ? `\nفضا: ${data.area}` : "");
      setSummary({ id: json.id, text });
      setStatus("done");
      form.reset();
    } catch {
      setMessage("ارتباط برقرار نشد؛ لطفاً تماس بگیرید یا در واتساپ پیام بدهید.");
      setStatus("error");
    }
  }

  const err = (k: string) => (errors[k] ? <span className="f-err">{errors[k]}</span> : null);

  return (
    <section className="section reserve" id="reserve">
      <div className="reserve-glow" aria-hidden="true" />
      <SectionHead eyebrow="رزرو" title={<>میز شما <em>آماده است</em></>}>
        فرم را پر کنید؛ همکاران ما برای هماهنگی نهایی با شما تماس می‌گیرند.
      </SectionHead>

      <div className="reserve-card" data-reveal>
        <AnimatePresence mode="wait">
          {status === "done" && summary ? (
            <motion.div
              key="done"
              className="reserve-done"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <svg viewBox="0 0 80 80" className="done-check" aria-hidden="true">
                <motion.circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                <motion.path d="M24 41l11 11 22-24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.7 }} />
              </svg>
              <h3>درخواست شما ثبت شد</h3>
              <p>
                کد پیگیری: <b>{toFa(summary.id)}</b> — به‌زودی با شما تماس می‌گیریم. برای هماهنگی سریع‌تر
                می‌توانید همین حالا در واتساپ پیام بدهید.
              </p>
              <div className="reserve-done-actions">
                <a className="btn btn-gold" href={waLink(summary.text)} target="_blank" rel="noreferrer">
                  ارسال در واتساپ
                </a>
                <button className="btn btn-ghost" onClick={() => setStatus("idle")}>
                  رزرو دیگر
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="f-grid">
                <label className="f-field">
                  <span>نام و نام خانوادگی</span>
                  <input name="name" required autoComplete="name" placeholder="مثلاً: سارا محمدی" aria-invalid={!!errors.name} />
                  {err("name")}
                </label>
                <label className="f-field">
                  <span>شماره موبایل</span>
                  <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" dir="ltr" aria-invalid={!!errors.phone} />
                  {err("phone")}
                </label>
                <label className="f-field">
                  <span>نوع رزرو</span>
                  <select name="event_type" required defaultValue="" aria-invalid={!!errors.event_type}>
                    <option value="" disabled>انتخاب کنید</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  {err("event_type")}
                </label>
                <label className="f-field">
                  <span>تعداد مهمانان</span>
                  <input name="guests" required inputMode="numeric" placeholder="مثلاً ۲۰" aria-invalid={!!errors.guests} />
                  {err("guests")}
                </label>
                <label className="f-field">
                  <span>تاریخ</span>
                  <input name="date_text" required placeholder="مثلاً پنجشنبه ۲۲ آبان" aria-invalid={!!errors.date_text} />
                  {err("date_text")}
                </label>
                <label className="f-field">
                  <span>زمان</span>
                  <select name="time_text" defaultValue="شام">
                    {TIMES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <fieldset className="f-field f-wide f-areas">
                  <legend>فضای دلخواه</legend>
                  <div className="f-chips">
                    {AREAS.map((a, i) => (
                      <label key={a} className="f-chip">
                        <input type="radio" name="area" value={a} defaultChecked={i === 2} />
                        <span>{a}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="f-field f-wide">
                  <span>توضیحات (اختیاری)</span>
                  <textarea name="notes" rows={3} placeholder="دکور، کیک، منوی خاص، نیاز به صندلی کودک و…" />
                </label>
                <input type="text" name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              </div>
              {message && <p className="f-message" role="alert">{message}</p>}
              <div className="f-actions">
                <button className="btn btn-gold btn-lg" disabled={status === "sending"}>
                  {status === "sending" ? "در حال ثبت…" : "ثبت درخواست رزرو"}
                </button>
                <span className="f-or">
                  یا تماس مستقیم: <a href={SITE.phoneHref}>{SITE.phone}</a>
                </span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
