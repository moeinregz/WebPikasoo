import { db, type Coupon } from "@/lib/db";
import { deleteCouponAction, saveCouponAction, toggleCouponAction } from "../../actions";
import { ConfirmButton } from "../../ui";

export const metadata = { title: "کد تخفیف" };

export default function Coupons() {
  const rows = db().prepare("SELECT * FROM coupons ORDER BY id DESC").all() as Coupon[];
  return (
    <>
      <h1>کدهای تخفیف</h1>
      <div className="card stack">
        <b>+ کد جدید (یا ویرایش کد موجود با همون اسم)</b>
        <form action={saveCouponAction} className="inline-form">
          <div className="field"><label>کد</label><input name="code" required dir="ltr" placeholder="YALDA" /></div>
          <div className="field"><label>نوع</label><select name="type"><option value="percent">درصدی</option><option value="amount">مبلغ ثابت (تومان)</option></select></div>
          <div className="field"><label>مقدار</label><input name="value" required dir="ltr" /></div>
          <div className="field"><label>حداقل خرید</label><input name="min_total" defaultValue="0" dir="ltr" /></div>
          <div className="field"><label>سقف استفاده (۰=نامحدود)</label><input name="max_uses" defaultValue="0" dir="ltr" /></div>
          <div className="field"><label>انقضا (اختیاری)</label><input name="expires_at" type="date" /></div>
          <label className="check"><input type="checkbox" name="club_only" /> فقط اعضای باشگاه</label>
          <button className="btn">ذخیره</button>
        </form>
      </div>
      <div className="card tbl-wrap" style={{ marginTop: 14, padding: 8 }}>
        <table className="tbl">
          <thead><tr><th>کد</th><th>تخفیف</th><th>حداقل خرید</th><th>استفاده</th><th>شرایط</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td dir="ltr" style={{ textAlign: "right", fontWeight: 700 }}>{c.code}</td>
                <td>{c.type === "percent" ? `٪${c.value.toLocaleString("fa-IR")}` : `${c.value.toLocaleString("fa-IR")} تومان`}</td>
                <td>{c.min_total.toLocaleString("fa-IR")}</td>
                <td>{c.used.toLocaleString("fa-IR")}{c.max_uses ? ` / ${c.max_uses.toLocaleString("fa-IR")}` : ""}</td>
                <td className="muted" style={{ fontSize: ".8rem" }}>{c.club_only ? "فقط اعضا" : "همه"}{c.expires_at ? ` · تا ${c.expires_at}` : ""}</td>
                <td>
                  <form action={toggleCouponAction}><input type="hidden" name="id" value={c.id} /><button className={`pill ${c.is_active ? "ok" : "bad"}`}>{c.is_active ? "فعال" : "غیرفعال"}</button></form>
                </td>
                <td>
                  <form action={deleteCouponAction}><input type="hidden" name="id" value={c.id} /><ConfirmButton message="کد حذف بشه؟">حذف</ConfirmButton></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
