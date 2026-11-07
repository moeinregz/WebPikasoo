import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getCurrentUser } from "@/lib/session";
import { getInquiriesByUserId, getTicketsByUserId, getTicketMessages } from "@/lib/db";
import AuthForms from "./AuthForms";
import { SmokeyBackground } from "@/components/ui/login-form";
import UserDashboard from "./UserDashboard";

export const metadata = {
  title: "حساب کاربری — وب پیکاسو",
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const user = await getCurrentUser();

  // فقط مسیرهای داخلی و نسبی رو قبول می‌کنیم (با یه اسلش شروع بشه و با
  // «//» یا «/\» شروع نشه) تا کسی نتونه با این پارامتر کاربر رو به یه
  // سایت بیرونی ریدایرکت کنه (open redirect).
  const rawNext = searchParams?.next ?? "";
  const next = /^\/(?!\/|\\)/.test(rawNext) ? rawNext : undefined;

  // Admins/developers have their own workspace — send them there instead
  // of the customer dashboard (mirrors /dashboard sending customers back
  // here).
  if (user?.isStaff) {
    redirect("/dashboard");
  }

  // اگه کاربر از قبل وارد بوده (مثلاً سشنش هنوز برقراره) و با لینک
  // «next» به این صفحه اومده، دیگه لازم نیست فرم ورود رو ببینه —
  // مستقیم برگرده همون صفحه‌ای که ازش اومده (مثلاً صفحه‌ی سفارش).
  if (user && next) {
    redirect(next);
  }

  let projects: Awaited<ReturnType<typeof getInquiriesByUserId>> = [];
  let tickets: Array<
    Awaited<ReturnType<typeof getTicketsByUserId>>[number] & {
      messages: Awaited<ReturnType<typeof getTicketMessages>>;
    }
  > = [];
  if (user) {
    const userTickets = await getTicketsByUserId(user.id);
    [projects, tickets] = await Promise.all([
      getInquiriesByUserId(user.id),
      Promise.all(
        userTickets.map(async (t) => ({ ...t, messages: await getTicketMessages(t.id) }))
      ),
    ]);
  }

  return (
    <>
      <Nav isLoggedIn={!!user} />
      {user ? (
        <main className="flex min-h-[calc(100vh-68px)] items-center justify-center px-6 py-24">
          <UserDashboard
            user={{ name: user.name, phone: user.phone, createdAt: user.createdAt }}
            projects={projects}
            tickets={tickets}
          />
        </main>
      ) : (
        // ورود / ثبت‌نام: کارت شیشه‌ای روی دود قرمز خونیِ WebGL
        <main className="relative isolate flex min-h-[calc(100vh-56px)] items-center justify-center overflow-hidden px-4 py-16">
          <SmokeyBackground color="#8f0a20" className="-z-10" />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(5_5_6/0.75))]" />
          <div className="w-full">
            <div className="mb-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-mono text-[12.5px] font-semibold text-white/60 transition hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px] rotate-180">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                بازگشت به صفحه اصلی
              </Link>
            </div>
            <AuthForms next={next} />
          </div>
        </main>
      )}
    </>
  );
}
