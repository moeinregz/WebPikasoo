import { redirect } from "next/navigation";
import { currentAdminId } from "@/lib/auth";
import { adminLoginAction } from "../actions";
import { StateForm, Submit } from "../ui";

export const metadata = { title: "ورود مدیر", robots: { index: false } };

export default function AdminLogin() {
  if (currentAdminId()) redirect("/admin");
  return (
    <div className="gateway-page" style={{ background: "linear-gradient(135deg,#1f130c,#6b3f26)" }}>
      <div className="card" style={{ maxWidth: 380, width: "100%" }}>
        <div className="logo" style={{ justifyContent: "center", marginBottom: 16 }}>
          <span className="cup" style={{ color: "#fff" }}>☕</span>پنل مدیریت ممد قهوه
        </div>
        <StateForm action={adminLoginAction}>
          <div className="field"><label>نام کاربری</label><input name="username" required dir="ltr" autoComplete="username" /></div>
          <div className="field"><label>رمز عبور</label><input name="password" type="password" required dir="ltr" autoComplete="current-password" /></div>
          <Submit className="btn block">ورود</Submit>
        </StateForm>
      </div>
    </div>
  );
}
