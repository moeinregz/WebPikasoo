import { db, type Slide } from "@/lib/db";
import { deleteSlideAction, saveSlideAction } from "../../actions";
import { ConfirmButton } from "../../ui";

export const metadata = { title: "اسلایدر" };

function SlideForm({ s }: { s?: Slide }) {
  return (
    <form action={saveSlideAction} className="grid2" encType="multipart/form-data">
      <input type="hidden" name="id" value={s?.id || ""} />
      <div className="field"><label>عنوان</label><input name="title" defaultValue={s?.title} required /></div>
      <div className="field"><label>متن زیر عنوان</label><input name="subtitle" defaultValue={s?.subtitle} /></div>
      <div className="field"><label>متن دکمه</label><input name="button_text" defaultValue={s?.button_text} /></div>
      <div className="field"><label>لینک دکمه</label><input name="button_link" defaultValue={s?.button_link || "/shop"} dir="ltr" /></div>
      <div className="field"><label>عکس پس‌زمینه (اختیاری)</label><input type="file" name="image_file" accept="image/*" /><small>عریض، حداقل ۱۶۰۰×۷۰۰</small></div>
      <div className="field"><label>یا آدرس عکس</label><input name="image_url" defaultValue={s?.image} dir="ltr" /></div>
      <div className="field"><label>رنگ پس‌زمینه</label><input type="color" name="bg" defaultValue={s?.bg || "#3b2316"} style={{ height: 46, padding: 4 }} /></div>
      <div className="field"><label>ایموجی (وقتی عکس نداره)</label><input name="emoji" defaultValue={s?.emoji || "☕"} /></div>
      <div className="field"><label>ترتیب</label><input name="sort" defaultValue={s?.sort ?? 0} dir="ltr" /></div>
      <div className="field" style={{ justifyContent: "flex-end" }}>
        <label className="check"><input type="checkbox" name="is_active" defaultChecked={s ? !!s.is_active : true} /> فعال</label>
        {s?.image && <label className="check"><input type="checkbox" name="remove_image" /> حذف عکس</label>}
      </div>
      <div className="span2"><button className="btn">{s ? "ذخیره" : "افزودن اسلاید"}</button></div>
    </form>
  );
}

export default function Slides() {
  const rows = db().prepare("SELECT * FROM slides ORDER BY sort, id").all() as Slide[];
  return (
    <>
      <h1>اسلایدر صفحه‌ی اول</h1>
      <p className="muted" style={{ marginBottom: 12 }}>اسلایدها هر ۳ ثانیه خودکار عوض می‌شن. روی گوشی هم با کشیدن جابه‌جا می‌شن.</p>
      <div className="card stack"><b>+ اسلاید جدید</b><SlideForm /></div>
      {rows.map((s) => (
        <div className="card stack" key={s.id} style={{ marginTop: 14, borderInlineStart: `8px solid ${s.bg}` }}>
          <SlideForm s={s} />
          <form action={deleteSlideAction}>
            <input type="hidden" name="id" value={s.id} />
            <ConfirmButton message="اسلاید حذف بشه؟">حذف اسلاید</ConfirmButton>
          </form>
        </div>
      ))}
    </>
  );
}
