"use client";
import { useFormState, useFormStatus } from "react-dom";
import { profileAction, type FormState } from "../club/actions";

function Save() {
  const { pending } = useFormStatus();
  return <button className="btn" disabled={pending}>{pending ? "…" : "ذخیره"}</button>;
}

export default function ProfileForm({ me }: { me: { name: string; city: string; address: string; postal_code: string; birthday: string } }) {
  const [st, act] = useFormState<FormState, FormData>(profileAction, {});
  return (
    <form action={act} className="card stack">
      <b>اطلاعات من</b>
      <div className="grid2">
        <div className="field"><label>نام</label><input name="name" defaultValue={me.name} required /></div>
        <div className="field"><label>تاریخ تولد</label><input name="birthday" defaultValue={me.birthday} /></div>
        <div className="field"><label>شهر</label><input name="city" defaultValue={me.city} /></div>
        <div className="field"><label>کد پستی</label><input name="postal_code" defaultValue={me.postal_code} dir="ltr" /></div>
        <div className="field span2"><label>آدرس</label><textarea name="address" defaultValue={me.address} style={{ minHeight: 70 }} /></div>
        <div className="field span2"><label>رمز جدید (اگه می‌خوای عوض کنی)</label><input name="new_password" type="password" minLength={6} /></div>
      </div>
      {st.error && <div className="alert bad">{st.error}</div>}
      {st.ok && <div className="alert ok">{st.ok}</div>}
      <Save />
    </form>
  );
}
