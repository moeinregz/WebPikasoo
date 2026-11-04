import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { getMenu, listReservations, reservationStats, type ReservationStatus } from "@/lib/db";
import { toFa } from "@/lib/fa";
import { SITE } from "@/lib/site";
import LoginForm from "./LoginForm";
import {
  addItemAction,
  deleteItemAction,
  logoutAction,
  setStatusAction,
  toggleItemAction,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پنل مدیریت", robots: { index: false, follow: false } };

const STATUS_LABEL: Record<ReservationStatus, string> = {
  new: "جدید",
  confirmed: "تأیید شده",
  done: "انجام شده",
  cancelled: "لغو شده",
};

function fmtDate(sqlUtc: string) {
  const d = new Date(sqlUtc.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: "Asia/Tehran",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <main className="adm">
        <div className="adm-login">
          <h1>پنل غیرفعال است</h1>
          <p>
            برای فعال شدن پنل، متغیر محیطی <code>ADMIN_PASSWORD</code> را روی سرور تنظیم کنید.
          </p>
        </div>
      </main>
    );
  }
  if (!(await isAdmin())) {
    return (
      <main className="adm">
        <LoginForm />
      </main>
    );
  }

  const reservations = listReservations();
  const stats = Object.fromEntries(reservationStats().map((s) => [s.status, s.n]));
  const menu = getMenu({ includeHidden: true });

  return (
    <main className="adm">
      <header className="adm-head">
        <div>
          <span className="adm-brand">{SITE.name}</span>
          <h1>پنل مدیریت</h1>
        </div>
        <form action={logoutAction}>
          <button className="btn btn-ghost">خروج</button>
        </form>
      </header>

      <section className="adm-stats">
        {(Object.keys(STATUS_LABEL) as ReservationStatus[]).map((s) => (
          <div key={s} className={`adm-stat st-${s}`}>
            <b>{toFa(stats[s] ?? 0)}</b>
            <span>{STATUS_LABEL[s]}</span>
          </div>
        ))}
      </section>

      <section className="adm-card">
        <h2>درخواست‌های رزرو</h2>
        {reservations.length === 0 ? (
          <p className="adm-empty">هنوز درخواستی ثبت نشده است.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>نام</th>
                  <th>تماس</th>
                  <th>مراسم</th>
                  <th>نفرات</th>
                  <th>تاریخ / زمان</th>
                  <th>فضا</th>
                  <th>توضیحات</th>
                  <th>ثبت</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className={`row-${r.status}`}>
                    <td>{toFa(r.id)}</td>
                    <td>{r.name}</td>
                    <td className="adm-contact">
                      <a href={`tel:${r.phone}`}>{toFa(r.phone)}</a>
                      <a
                        href={`https://wa.me/98${r.phone.slice(1)}?text=${encodeURIComponent(
                          `سلام ${r.name} عزیز، از باغچه رستوران شاهکار تماس می‌گیریم درباره‌ی رزرو ${r.event_type}.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        واتساپ
                      </a>
                    </td>
                    <td>{r.event_type}</td>
                    <td>{toFa(r.guests)}</td>
                    <td>
                      {r.date_text}
                      {r.time_text && <small> — {r.time_text}</small>}
                    </td>
                    <td>{r.area || "—"}</td>
                    <td className="adm-notes">{r.notes || "—"}</td>
                    <td className="adm-muted">{fmtDate(r.created_at)}</td>
                    <td>
                      <div className="adm-status">
                        {(Object.keys(STATUS_LABEL) as ReservationStatus[]).map((s) => (
                          <form key={s} action={setStatusAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value={s} />
                            <button className={`chip ${r.status === s ? "on" : ""} st-${s}`}>{STATUS_LABEL[s]}</button>
                          </form>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="adm-card">
        <h2>مدیریت منو</h2>
        <form action={addItemAction} className="adm-add">
          <select name="category_id" required>
            {menu.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <input name="name" placeholder="نام غذا" required maxLength={80} />
          <input name="description" placeholder="توضیح کوتاه" maxLength={200} />
          <input name="price" placeholder="قیمت (تومان، اختیاری)" inputMode="numeric" />
          <label className="adm-check">
            <input type="checkbox" name="featured" /> پیشنهاد سرآشپز
          </label>
          <button className="btn btn-gold">افزودن</button>
        </form>

        <div className="adm-menu">
          {menu.map((c) => (
            <div key={c.id} className="adm-menu-cat">
              <h3>{c.title}</h3>
              <ul>
                {c.items.map((i) => (
                  <li key={i.id} className={i.visible ? "" : "hidden-item"}>
                    <div>
                      <b>{i.name}</b>
                      {i.featured ? <span className="tag">پیشنهاد</span> : null}
                      {i.price != null && <span className="adm-muted"> — {toFa(i.price.toLocaleString("en"))} تومان</span>}
                      <p>{i.description}</p>
                    </div>
                    <div className="adm-item-actions">
                      <form action={toggleItemAction}>
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="field" value="visible" />
                        <button className="chip">{i.visible ? "مخفی کن" : "نمایش"}</button>
                      </form>
                      <form action={toggleItemAction}>
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="field" value="featured" />
                        <button className="chip">{i.featured ? "حذف پیشنهاد" : "پیشنهاد"}</button>
                      </form>
                      <form action={deleteItemAction}>
                        <input type="hidden" name="id" value={i.id} />
                        <button className="chip danger">حذف</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <p className="adm-muted adm-foot">
        <a href="/">← بازگشت به سایت</a> · <a href={SITE.phoneHref}>{SITE.phone}</a>
      </p>
    </main>
  );
}
