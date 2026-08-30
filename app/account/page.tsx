import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getInquiriesByUserId, getTicketsByUserId, getTicketMessages } from "@/lib/db";
import AuthForms from "./AuthForms";
import UserDashboard from "./UserDashboard";

export const metadata = {
  title: "حساب کاربری — وب پیکاسو",
  robots: { index: false, follow: false },
};

// Only an internal path is ever accepted for `next` (must start with a
// single "/", never "//..." which browsers treat as protocol-relative and
// would send the person off-site) — this is a redirect target coming
// straight from the URL, so it can't be trusted blindly.
function safeNextPath(raw?: string): string | undefined {
  if (!raw) return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const user = await getCurrentUser();
  const next = safeNextPath(searchParams?.next);

  // Admins/developers have their own workspace — send them there instead
  // of the customer dashboard (mirrors /dashboard sending customers back
  // here). A `next` target (e.g. back to /order) only ever makes sense
  // for a customer completing a purchase, so staff still always land on
  // /dashboard regardless of it.
  if (user?.isStaff) {
    redirect("/dashboard");
  }

  // Already logged in (as a customer) and arrived here with a `next`
  // target — e.g. clicked "ورود / ثبت‌نام" on a plan card from a stale tab
  // that still shows them logged out. Send them straight back instead of
  // showing the dashboard.
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
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      {user ? (
        <UserDashboard
          user={{ name: user.name, phone: user.phone, createdAt: user.createdAt }}
          projects={projects}
          tickets={tickets}
        />
      ) : (
        <div className="w-full">
          <div className="mx-auto mb-8 max-w-sm text-center md:max-w-none">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-semibold text-dim transition hover:text-accent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px] rotate-180">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              بازگشت به صفحه اصلی
            </Link>
            <h1 className="mb-2 font-display text-2xl font-normal">حساب کاربری</h1>
            <p className="text-sm text-dim">
              {next
                ? "برای ادامه‌ی خرید، اول وارد شو یا حساب بساز."
                : "وارد شو یا حساب بساز تا وضعیت پروژه‌ت رو دنبال کنی."}
            </p>
          </div>
          <AuthForms next={next} />
        </div>
      )}
    </main>
  );
}
