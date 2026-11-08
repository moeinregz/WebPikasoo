"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, registerAction, type FormState } from "./actions";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button className="btn block" disabled={pending}>{pending ? "صبر کن…" : children}</button>;
}

export default function AuthForms({ next }: { next: string }) {
  const [tab, setTab] = useState<"register" | "login">("register");
  const [rs, reg] = useFormState<FormState, FormData>(registerAction, {});
  const [ls, log] = useFormState<FormState, FormData>(loginAction, {});
  return (
    <div className="card" id="login" style={{ maxWidth: 460, margin: "0 auto" }}>
      <div className="tabs" style={{ margin: "0 auto 18px" }}>
        <button type="button" className={tab === "register" ? "on" : ""} onClick={() => setTab("register")}>عضویت</button>
        <button type="button" className={tab === "login" ? "on" : ""} onClick={() => setTab("login")}>ورود</button>
      </div>
      {tab === "register" ? (
        <form action={reg} className="stack">
          <input type="hidden" name="next" value={next} />
          <div className="field"><label>نام و نام خانوادگی</label><input name="name" required /></div>
          <div className="field"><label>شماره موبایل</label><input name="phone" required inputMode="tel" dir="ltr" placeholder="09xxxxxxxxx" /></div>
          <div className="field"><label>رمز عبور</label><input name="password" type="password" required minLength={6} /></div>
          <div className="field"><label>تاریخ تولد (اختیاری)</label><input name="birthday" placeholder="مثلاً ۱۳۷۵/۰۶/۱۲" /><small>برای هدیه‌ی تولد سطح طلایی</small></div>
          {rs.error && <div className="alert bad">{rs.error}</div>}
          <Submit>عضویت رایگان و گرفتن امتیاز هدیه</Submit>
        </form>
      ) : (
        <form action={log} className="stack">
          <input type="hidden" name="next" value={next} />
          <div className="field"><label>شماره موبایل</label><input name="phone" required inputMode="tel" dir="ltr" /></div>
          <div className="field"><label>رمز عبور</label><input name="password" type="password" required /></div>
          {ls.error && <div className="alert bad">{ls.error}</div>}
          <Submit>ورود</Submit>
        </form>
      )}
    </div>
  );
}
