import { getSettings, siteUrl } from "@/lib/settings";
import { adminPasswordAction, saveSettingsAction } from "../../actions";
import { StateForm, Submit } from "../../ui";

export const metadata = { title: "تنظیمات" };

type S = Record<string, string>;

function T({ s, k, label, hint, ltr }: { s: S; k: string; label: string; hint?: string; ltr?: boolean }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input name={k} defaultValue={s[k]} dir={ltr ? "ltr" : undefined} />
      {hint && <small>{hint}</small>}
    </div>
  );
}

function Secret({ s, k, label }: { s: S; k: string; label: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input name={k} type="password" dir="ltr" autoComplete="new-password" placeholder={s[k] ? "•••••• ذخیره شده (برای تغییر بنویس)" : ""} />
    </div>
  );
}

function Flag({ s, k, label }: { s: S; k: string; label: string }) {
  return (
    <label className="check">
      <input type="hidden" name={`_flag_${k}`} value="1" />
      <input type="checkbox" name={k} defaultChecked={s[k] === "1"} /> {label}
    </label>
  );
}

export default function Settings() {
  const s = getSettings();
  const cb = (id: string) => `${siteUrl()}/api/payment/callback/${id}`;
  return (
    <>
      <h1>تنظیمات</h1>
      <div className="stack">
        <StateForm action={saveSettingsAction} className="card stack">
          <input type="hidden" name="_section" value="فروشگاه" />
          <b>🏬 فروشگاه و ارسال</b>
          <div className="grid2">
            <T s={s} k="shop_name" label="نام فروشگاه" />
            <T s={s} k="shop_tagline" label="شعار" />
            <T s={s} k="shop_phone" label="تلفن" />
            <T s={s} k="instagram" label="اینستاگرام" ltr />
            <div className="span2"><T s={s} k="shop_address" label="آدرس" /></div>
            <T s={s} k="shipping_fee" label="هزینه‌ی ارسال (تومان)" ltr />
            <T s={s} k="free_shipping_over" label="ارسال رایگان برای خرید بالای (تومان)" hint="۰ = همیشه هزینه‌ی ارسال" ltr />
          </div>
          <Submit>ذخیره</Submit>
        </StateForm>

        <StateForm action={saveSettingsAction} className="card stack">
          <input type="hidden" name="_section" value="باشگاه" />
          <b>🎁 باشگاه مشتریان</b>
          <div className="grid2">
            <T s={s} k="club_earn_per" label="به ازای هر چند تومان خرید ۱ امتیاز؟" ltr />
            <T s={s} k="club_point_value" label="ارزش هر امتیاز موقع خرج کردن (تومان)" ltr />
            <T s={s} k="club_welcome_points" label="امتیاز هدیه‌ی عضویت" ltr />
            <T s={s} k="club_max_redeem_percent" label="حداکثر درصد سفارش که با امتیاز پرداخت می‌شه" ltr />
          </div>
          <p className="muted" style={{ fontSize: ".82rem" }}>سطح‌ها: برنزی (×۱)، نقره‌ای از ۳ میلیون خرید (×۱.۵)، طلایی از ۸ میلیون (×۲). برای تغییر سطح‌ها فایل lib/club.ts رو ویرایش کن.</p>
          <Submit>ذخیره</Submit>
        </StateForm>

        <StateForm action={saveSettingsAction} className="card stack">
          <input type="hidden" name="_section" value="درگاه‌ها" />
          <b>💳 درگاه‌های پرداخت</b>

          <fieldset className="card stack" style={{ boxShadow: "none", border: "1px solid var(--line)" }}>
            <Flag s={s} k="pay_mock_enabled" label="درگاه آزمایشی (فقط برای تست — قبل از فروش واقعی خاموش کن)" />
          </fieldset>

          <fieldset className="card stack" style={{ boxShadow: "none", border: "1px solid var(--line)" }}>
            <b>زرین‌پال (کارت‌های شتاب)</b>
            <Flag s={s} k="zarinpal_enabled" label="فعال" />
            <Flag s={s} k="zarinpal_sandbox" label="حالت تست (sandbox)" />
            <T s={s} k="zarinpal_merchant" label="مرچنت کد" ltr />
            <small className="muted" dir="ltr">Callback: {cb("zarinpal")}</small>
          </fieldset>

          <fieldset className="card stack" style={{ boxShadow: "none", border: "1px solid var(--line)" }}>
            <b>اسنپ‌پی (اقساطی)</b>
            <Flag s={s} k="snappay_enabled" label="فعال" />
            <div className="grid2">
              <div className="span2"><T s={s} k="snappay_base_url" label="آدرس API (از اسنپ‌پی بگیر)" ltr /></div>
              <T s={s} k="snappay_client_id" label="Client ID" ltr />
              <Secret s={s} k="snappay_client_secret" label="Client Secret" />
              <T s={s} k="snappay_username" label="Username" ltr />
              <Secret s={s} k="snappay_password" label="Password" />
            </div>
            <small className="muted" dir="ltr">Return URL: {cb("snappay")}</small>
          </fieldset>

          <fieldset className="card stack" style={{ boxShadow: "none", border: "1px solid var(--line)" }}>
            <b>دیجی‌پی</b>
            <Flag s={s} k="digipay_enabled" label="فعال" />
            <div className="grid2">
              <T s={s} k="digipay_base_url" label="آدرس API" hint="تست: https://uat.mydigipay.info — اصلی رو دیجی‌پی می‌ده" ltr />
              <T s={s} k="digipay_ticket_type" label="نوع تیکت (type)" hint="طبق قرارداد دیجی‌پی" ltr />
              <T s={s} k="digipay_client_id" label="Client ID" ltr />
              <Secret s={s} k="digipay_client_secret" label="Client Secret" />
              <T s={s} k="digipay_username" label="Username" ltr />
              <Secret s={s} k="digipay_password" label="Password" />
            </div>
            <small className="muted" dir="ltr">Callback: {cb("digipay")}</small>
          </fieldset>
          <Submit>ذخیره‌ی درگاه‌ها</Submit>
        </StateForm>

        <StateForm action={saveSettingsAction} className="card stack">
          <input type="hidden" name="_section" value="باسلام" />
          <b>🛍️ اتصال به غرفه‌ی باسلام</b>
          <p className="muted" style={{ fontSize: ".85rem" }}>
            از developers.basalam.com یک توکن دسترسی با مجوز مدیریت محصولات غرفه بساز. بعد از ذخیره، تو صفحه‌ی هر محصول دکمه‌ی «ارسال به باسلام» فعال می‌شه.
          </p>
          <div className="grid2">
            <Secret s={s} k="basalam_token" label="توکن دسترسی (Access Token)" />
            <T s={s} k="basalam_vendor_id" label="شناسه‌ی غرفه (Vendor ID)" ltr />
            <T s={s} k="basalam_category_id" label="شناسه‌ی دسته‌بندی پیش‌فرض باسلام" ltr />
            <T s={s} k="basalam_base_url" label="آدرس API" ltr />
          </div>
          <Submit>ذخیره</Submit>
        </StateForm>

        <StateForm action={adminPasswordAction} className="card stack">
          <b>🔐 تغییر رمز مدیر</b>
          <div className="grid2">
            <div className="field"><label>رمز فعلی</label><input name="current" type="password" required dir="ltr" /></div>
            <div className="field"><label>رمز جدید (حداقل ۸ کاراکتر)</label><input name="next" type="password" required minLength={8} dir="ltr" /></div>
          </div>
          <Submit>تغییر رمز</Submit>
        </StateForm>
      </div>
    </>
  );
}
