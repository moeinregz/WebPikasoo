import { getSettings, siteUrl } from "@/lib/settings";
import { adminPasswordAction, basalamCategoryAction, basalamTestAction, saveSettingsAction, testGatewayAction } from "../../actions";
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

function TestBtn({ id }: { id: string }) {
  return (
    <StateForm action={testGatewayAction} className="row">
      <input type="hidden" name="gateway" value={id} />
      <Submit className="btn light sm">🔌 تست اتصال</Submit>
    </StateForm>
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

        <div className="card stack">
          <b>💳 درگاه‌های پرداخت</b>
          <p className="muted" style={{ fontSize: ".85rem" }}>
            هر درگاه رو جدا ذخیره کن و بعد «تست اتصال» رو بزن. تست، پرداختی انجام نمی‌ده؛ فقط ورود و کلیدها رو چک می‌کنه.
            آدرس بازگشت (Callback) هر درگاه زیرش نوشته شده؛ اگه درگاه موقع قرارداد خواست، همین رو بده.
          </p>

          <StateForm action={saveSettingsAction} className="card stack">
            <input type="hidden" name="_section" value="درگاه آزمایشی" />
            <Flag s={s} k="pay_mock_enabled" label="درگاه آزمایشی (فقط برای تست — قبل از فروش واقعی خاموش کن)" />
            <Submit className="btn light sm">ذخیره</Submit>
          </StateForm>

          <div className="card stack">
            <b>زرین‌پال (کارت‌های شتاب)</b>
            <StateForm action={saveSettingsAction}>
              <input type="hidden" name="_section" value="زرین‌پال" />
              <Flag s={s} k="zarinpal_enabled" label="فعال" />
              <Flag s={s} k="zarinpal_sandbox" label="حالت تست (sandbox)" />
              <T s={s} k="zarinpal_merchant" label="مرچنت کد" ltr />
              <small className="muted" dir="ltr">Callback: {cb("zarinpal")}</small>
              <Submit className="btn sm">ذخیره</Submit>
            </StateForm>
            <TestBtn id="zarinpal" />
          </div>

          <div className="card stack">
            <b>اسنپ‌پی (اقساطی)</b>
            <StateForm action={saveSettingsAction}>
              <input type="hidden" name="_section" value="اسنپ‌پی" />
              <Flag s={s} k="snappay_enabled" label="فعال" />
              <div className="grid2">
                <div className="span2"><T s={s} k="snappay_base_url" label="آدرس API" hint="آدرس تست یا اصلی رو اسنپ‌پی بعد از قرارداد می‌ده. IP سرورت هم باید پیششون ثبت بشه." ltr /></div>
                <T s={s} k="snappay_client_id" label="Client ID" ltr />
                <Secret s={s} k="snappay_client_secret" label="Client Secret" />
                <T s={s} k="snappay_username" label="Username" ltr />
                <Secret s={s} k="snappay_password" label="Password" />
              </div>
              <small className="muted" dir="ltr">Return URL: {cb("snappay")}</small>
              <Submit className="btn sm">ذخیره</Submit>
            </StateForm>
            <TestBtn id="snappay" />
          </div>

          <div className="card stack">
            <b>دیجی‌پی</b>
            <StateForm action={saveSettingsAction}>
              <input type="hidden" name="_section" value="دیجی‌پی" />
              <Flag s={s} k="digipay_enabled" label="فعال" />
              <div className="grid2">
                <T s={s} k="digipay_base_url" label="آدرس API" hint="تست: https://uat.mydigipay.info — اصلی: https://api.mydigipay.com" ltr />
                <div className="field">
                  <label>نوع پرداخت (ticket type)</label>
                  <select name="digipay_ticket_type" defaultValue={s.digipay_ticket_type || "11"}>
                    <option value="11">11 — کیف پول دیجی‌پی (پیش‌فرض)</option>
                    <option value="0">0 — درگاه کارت بانکی</option>
                    <option value="5">5 — خرید اعتباری</option>
                    <option value="13">13 — اقساطی (BNPL)</option>
                    <option value="24">24 — کارت اعتباری دیجی‌پی</option>
                  </select>
                  <small>طبق قراردادت با دیجی‌پی انتخاب کن. برای ۵ و ۱۳، بعد از ارسال سفارش تحویل خودکار اعلام می‌شه.</small>
                </div>
                <T s={s} k="digipay_client_id" label="Client ID" ltr />
                <Secret s={s} k="digipay_client_secret" label="Client Secret" />
                <T s={s} k="digipay_username" label="Username" ltr />
                <Secret s={s} k="digipay_password" label="Password" />
              </div>
              <small className="muted" dir="ltr">Callback: {cb("digipay")}</small>
              <Submit className="btn sm">ذخیره</Submit>
            </StateForm>
            <TestBtn id="digipay" />
          </div>
        </div>

        <div className="card stack">
          <b>🛍️ اتصال به غرفه‌ی باسلام</b>
          <ol className="muted" style={{ fontSize: ".85rem", paddingInlineStart: 18, listStyle: "decimal" }}>
            <li>تو developers.basalam.com/panel/tokens یک «توکن دسترسی شخصی» با دسترسی مدیریت محصولات غرفه بساز و این‌جا وارد کن.</li>
            <li>ذخیره کن و «تست اتصال» رو بزن؛ شناسه‌ی غرفه خودکار پر می‌شه.</li>
            <li>با «جستجوی دسته» شناسه‌ی دسته‌ی باسلام (مثلاً قهوه) رو پیدا کن و وارد کن.</li>
            <li>از صفحه‌ی هر محصول «ارسال به باسلام» یا از لیست محصولات «ارسال همه» رو بزن. عکس محصول هم خودکار آپلود می‌شه.</li>
          </ol>
          <StateForm action={saveSettingsAction}>
            <input type="hidden" name="_section" value="باسلام" />
            <div className="grid2">
              <Secret s={s} k="basalam_token" label="توکن دسترسی (Access Token)" />
              <T s={s} k="basalam_vendor_id" label="شناسه‌ی غرفه (Vendor ID)" hint="با تست اتصال خودکار پر می‌شه" ltr />
              <T s={s} k="basalam_category_id" label="شناسه‌ی دسته‌بندی باسلام" ltr />
              <div className="field">
                <label>واحد قیمت در باسلام</label>
                <select name="basalam_price_unit" defaultValue={s.basalam_price_unit || "rial"}>
                  <option value="rial">ریال (قیمت سایت × ۱۰)</option>
                  <option value="toman">تومان (همون قیمت سایت)</option>
                </select>
                <small>بعد از ارسال اولین محصول، قیمتش رو تو باسلام چک کن؛ اگه ۱۰ برابر بود اینو عوض کن.</small>
              </div>
              <div className="field">
                <label>واحد فروش</label>
                <select name="basalam_unit_type" defaultValue={s.basalam_unit_type || "6304"}>
                  <option value="6304">عدد (هر بسته)</option>
                  <option value="6306">گرم</option>
                  <option value="6305">کیلوگرم</option>
                </select>
              </div>
              <T s={s} k="basalam_preparation_days" label="زمان آماده‌سازی (روز)" ltr />
              <div className="span2"><T s={s} k="basalam_base_url" label="آدرس API" ltr /></div>
            </div>
            <Submit className="btn sm">ذخیره</Submit>
          </StateForm>
          <StateForm action={basalamTestAction} className="row">
            <Submit className="btn light sm">🔌 تست اتصال باسلام</Submit>
          </StateForm>
          <StateForm action={basalamCategoryAction} className="stack">
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <input className="input" name="q" placeholder="جستجوی دسته‌ی باسلام، مثلاً: قهوه" />
              <Submit className="btn light sm">جستجوی دسته</Submit>
            </div>
          </StateForm>
        </div>

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
