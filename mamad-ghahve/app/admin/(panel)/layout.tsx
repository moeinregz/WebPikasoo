import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdminId } from "@/lib/auth";
import { adminLogoutAction } from "../actions";
import AdminNav from "./AdminNav";

export const metadata = { title: { default: "پنل مدیریت", template: "%s | پنل ممد قهوه" }, robots: { index: false } };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!currentAdminId()) redirect("/admin/login");
  return (
    <div className="admin">
      <aside>
        <Link href="/admin" className="logo"><span className="cup">☕</span>پنل ممد قهوه</Link>
        <AdminNav />
        <form action={adminLogoutAction} style={{ marginTop: 18 }} className="hide-sm">
          <button className="btn light sm block">خروج</button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
