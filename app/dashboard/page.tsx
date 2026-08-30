import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { markInquiryFollowedUpAction, deleteInquiryAction, deleteTicketAction } from "./actions";
import {
  getAllInquiries,
  getAllUsers,
  getAllTickets,
  getTicketMessages,
  getUsersByRole,
  getTeamMessages,
  getAllTasks,
  getTasksForUser,
  getAllCrmLeads,
  getUserPermissions,
  getAllBlogPosts,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toPersianDigits } from "@/lib/auth";
import DashboardTabs, { type DashboardTab } from "./DashboardTabs";
import StaffLoginForm from "./StaffLoginForm";
import TeamChat from "./TeamChat";
import AddUserForm from "./AddUserForm";
import UserActions from "./UserActions";
import AccessPanel from "./AccessPanel";
import CrmPanel from "./CrmPanel";
import { AdminTasksPanel, MyTasksPanel } from "./TasksPanel";
import OverviewPanel from "./OverviewPanel";
import BlogPanel from "./BlogPanel";

export const metadata = {
  title: "داشبورد — وب پیکاسو",
  robots: { index: false, follow: false },
};

function formatDateTime(iso: string) {
  // Stored as UTC "YYYY-MM-DD HH:MM:SS" from SQLite's datetime('now').
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
}

function IdBadge({ id }: { id: number }) {
  return (
    <span className="inline-flex items-center rounded-md border border-ink/[0.16] bg-canvas px-2 py-0.5 font-mono text-[11px] text-dim">
      #{toPersianDigits(id)}
    </span>
  );
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  // Nobody logged in — show the staff login form right here (same
  // phone+password accounts as /account; no separate admin password).
  if (!currentUser) {
    return (
      <>
        <Nav isLoggedIn={false} />
        <main className="flex min-h-[calc(100vh-68px)] items-center justify-center px-6">
          <StaffLoginForm />
        </main>
      </>
    );
  }

  // Logged in, but as a customer — this isn't their page, send them back
  // to their own dashboard instead of showing a staff login prompt.
  if (!currentUser.isStaff) {
    redirect("/account");
  }

  const isAdmin = currentUser.role === "admin";
  const perms = currentUser.permissions; // admins: everything true

  const inquiries = isAdmin || perms.orders ? await getAllInquiries() : [];
  const tickets = isAdmin || perms.tickets ? await getAllTickets() : [];
  const customers = isAdmin || perms.users ? await getAllUsers() : [];
  const developers = await getUsersByRole("developer");
  const admins = await getUsersByRole("admin");
  const teamMembers = [...admins, ...developers];
  const teamMessages = perms.chat ? await getTeamMessages() : [];
  const crmLeads = isAdmin || perms.crm ? await getAllCrmLeads() : [];
  const allTasks = isAdmin ? await getAllTasks() : [];
  const myTasks = !isAdmin ? await getTasksForUser(currentUser.id) : [];
  const blogPosts = isAdmin || perms.blog ? await getAllBlogPosts() : [];
  // Last message per ticket, for the one-line preview in the tickets list.
  const ticketLastMessages = await Promise.all(
    tickets.map(async (t) => {
      const msgs = await getTicketMessages(t.id);
      return msgs[msgs.length - 1];
    })
  );

  const ordersPanel =
    inquiries.length === 0 ? (
      <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
        به‌محض این‌که کسی فرم تماس رو پر کنه، همین‌جا نشونش می‌دیم.
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {inquiries.map((inq) => (
          <article
            key={inq.id}
            className={`rounded-card border p-6 ${
              inq.status === "followed_up"
                ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                : "border-ink/[0.14] bg-surface/20"
            }`}
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-normal">{inq.name}</h2>
                  <span
                    className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] ${
                      inq.status === "followed_up"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                        : "border-accent/30 bg-accent/10 text-accent"
                    }`}
                  >
                    {inq.status === "followed_up" ? "پیگیری شد" : "جدید"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12.5px] text-dim">
                  {inq.email && (
                    <Link
                      href={`mailto:${inq.email}`}
                      className="underline decoration-dim/40 underline-offset-4 hover:text-accent"
                      dir="ltr"
                    >
                      {inq.email}
                    </Link>
                  )}
                  {inq.phone && (
                    <>
                      {inq.email && <span aria-hidden="true">·</span>}
                      <Link href={`tel:${inq.phone}`} className="hover:text-accent" dir="ltr">
                        {inq.phone}
                      </Link>
                    </>
                  )}
                  {!inq.email && !inq.phone && <span>راه ارتباطی ثبت نشده</span>}
                </div>
              </div>
              <span className="whitespace-nowrap font-mono text-xs text-dim/70">
                {formatDateTime(inq.created_at)}
              </span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {inq.project_type && (
                <span className="rounded-md border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                  {inq.project_type}
                </span>
              )}
              {inq.budget && (
                <span className="rounded-md border border-ink/[0.2] px-3 py-1 font-mono text-xs text-dim">
                  بودجه: {inq.budget}
                </span>
              )}
            </div>

            <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink/90">{inq.message}</p>

            {isAdmin && (
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={markInquiryFollowedUpAction}>
                  <input type="hidden" name="inquiryId" value={inq.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={inq.status === "followed_up" ? "new" : "followed_up"}
                  />
                  <button
                    type="submit"
                    className={`rounded-full border px-4 py-1.5 text-[12.5px] font-bold transition ${
                      inq.status === "followed_up"
                        ? "border-ink/[0.2] text-dim hover:border-accent hover:text-accent"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    }`}
                  >
                    {inq.status === "followed_up" ? "برگردوندن به جدید" : "پیگیری شد ✓"}
                  </button>
                </form>
                <form action={deleteInquiryAction}>
                  <input type="hidden" name="inquiryId" value={inq.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-500/30 px-4 py-1.5 text-[12.5px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
                  >
                    حذف
                  </button>
                </form>
              </div>
            )}
          </article>
        ))}
      </div>
    );

  const usersPanel = (
    <div>
      {(isAdmin || perms.users) && (
        <AddUserForm
          defaultRole="customer"
          heading="افزودن کاربر جدید"
          buttonLabel="افزودن کاربر جدید"
          lockRoleToCustomer={!isAdmin}
        />
      )}
      {customers.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
          به‌محض این‌که کسی تو /account ثبت‌نام کنه، همین‌جا با شماره‌ش نشون داده می‌شه.
        </div>
      ) : (
        <>
          {/* Card list — phones/tablets. A side-scrolling table is
              unusable with one thumb, so below the desktop breakpoint
              each user gets its own stacked card instead. */}
          <div className="flex flex-col gap-3 lg:hidden">
            {customers.map((u) => (
              <div key={u.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[14.5px]">{u.name}</span>
                      <IdBadge id={u.id} />
                    </div>
                    <Link
                      href={`tel:${u.phone}`}
                      dir="ltr"
                      className="mt-1.5 inline-block font-mono text-[13px] text-dim hover:text-accent"
                    >
                      {toPersianDigits(u.phone)}
                    </Link>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] text-dim/70">
                    {formatDate(u.created_at)}
                  </span>
                </div>
                {isAdmin && (
                  <div className="mt-3 border-t border-ink/10 pt-3">
                    <UserActions id={u.id} name={u.name} phone={u.phone} role={u.role} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Table — desktop only. */}
          <div className="hidden overflow-x-auto rounded-card border border-ink/[0.14] lg:block">
            <table className="w-full min-w-[620px] border-collapse text-right text-[14px]">
              <thead>
                <tr className="bg-navy text-alabaster">
                  <th className="px-5 py-3.5 font-semibold">شناسه</th>
                  <th className="px-5 py-3.5 font-semibold">نام</th>
                  <th className="px-5 py-3.5 font-semibold">شماره موبایل</th>
                  <th className="px-5 py-3.5 font-semibold">تاریخ ثبت‌نام</th>
                  {isAdmin && <th className="px-5 py-3.5 font-semibold"></th>}
                </tr>
              </thead>
              <tbody>
                {customers.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? "bg-surface/20" : "bg-canvas"}>
                    <td className="px-5 py-3.5">
                      <IdBadge id={u.id} />
                    </td>
                    <td className="px-5 py-3.5 font-semibold">{u.name}</td>
                    <td className="px-5 py-3.5 font-mono" dir="ltr">
                      <Link href={`tel:${u.phone}`} className="hover:text-accent">
                        {toPersianDigits(u.phone)}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-dim">{formatDate(u.created_at)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <UserActions id={u.id} name={u.name} phone={u.phone} role={u.role} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const ticketsPanel =
    tickets.length === 0 ? (
      <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
        به‌محض این‌که یه کاربر از حساب خودش تیکت بزنه، همین‌جا نشونش می‌دیم.
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {tickets.map((t, ticketIndex) => {
          const lastMessage = ticketLastMessages[ticketIndex];
          return (
            <div
              key={t.id}
              className="group flex items-center justify-between gap-4 rounded-card border border-ink/[0.14] bg-surface/20 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface/40"
            >
              <Link href={`/dashboard/tickets/${t.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-base font-normal">{t.subject}</h2>
                  <span
                    className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] ${
                      t.status === "open"
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-ink/[0.2] text-dim"
                    }`}
                  >
                    {t.status === "open" ? "باز" : "بسته"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11.5px] text-dim">
                  <span>{t.user_name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{lastMessage ? lastMessage.message : t.message}</span>
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <span className="whitespace-nowrap font-mono text-xs text-dim/70">{formatDateTime(t.created_at)}</span>
                {isAdmin && (
                  <form action={deleteTicketAction}>
                    <input type="hidden" name="ticketId" value={t.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
                    >
                      حذف
                    </button>
                  </form>
                )}
                <Link href={`/dashboard/tickets/${t.id}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4 text-dim transition group-hover:translate-x-[-3px] group-hover:text-accent"
                  >
                    <path d="M15 6L9 12l6 6" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );

  const teamPanel = (
    <div>
      {isAdmin && (
        <AddUserForm
          defaultRole="developer"
          heading="افزودن عضو تیم"
          buttonLabel="افزودن برنامه‌نویس / ادمین"
        />
      )}
      {teamMembers.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
          هنوز عضوی از تیم برنامه‌نویسی یا ادمین اضافه نشده.
        </div>
      ) : (
        <>
          {/* Card list — phones/tablets. */}
          <div className="flex flex-col gap-3 lg:hidden">
            {teamMembers.map((u) => (
              <div key={u.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[14.5px]">{u.name}</span>
                      <IdBadge id={u.id} />
                    </div>
                    <span
                      className={`mt-1.5 inline-block rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                        u.role === "admin"
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-ink/[0.2] text-dim"
                      }`}
                    >
                      {u.title || (u.role === "admin" ? "ادمین" : "برنامه‌نویس")}
                    </span>
                    <Link
                      href={`tel:${u.phone}`}
                      dir="ltr"
                      className="mt-1.5 block font-mono text-[13px] text-dim hover:text-accent"
                    >
                      {toPersianDigits(u.phone)}
                    </Link>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] text-dim/70">
                    {formatDate(u.created_at)}
                  </span>
                </div>
                {isAdmin && (
                  <div className="mt-3 border-t border-ink/10 pt-3">
                    <UserActions id={u.id} name={u.name} phone={u.phone} role={u.role} title={u.title} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Table — desktop only. */}
          <div className="hidden overflow-x-auto rounded-card border border-ink/[0.14] lg:block">
            <table className="w-full min-w-[680px] border-collapse text-right text-[14px]">
              <thead>
                <tr className="bg-navy text-alabaster">
                  <th className="px-5 py-3.5 font-semibold">شناسه</th>
                  <th className="px-5 py-3.5 font-semibold">نام</th>
                  <th className="px-5 py-3.5 font-semibold">نقش</th>
                  <th className="px-5 py-3.5 font-semibold">شماره موبایل</th>
                  <th className="px-5 py-3.5 font-semibold">تاریخ عضویت</th>
                  {isAdmin && <th className="px-5 py-3.5 font-semibold"></th>}
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? "bg-surface/20" : "bg-canvas"}>
                    <td className="px-5 py-3.5">
                      <IdBadge id={u.id} />
                    </td>
                    <td className="px-5 py-3.5 font-semibold">{u.name}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                          u.role === "admin"
                            ? "border-accent/30 bg-accent/10 text-accent"
                            : "border-ink/[0.2] text-dim"
                        }`}
                      >
                        {u.title || (u.role === "admin" ? "ادمین" : "برنامه‌نویس")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono" dir="ltr">
                      <Link href={`tel:${u.phone}`} className="hover:text-accent">
                        {toPersianDigits(u.phone)}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-dim">{formatDate(u.created_at)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <UserActions
                          id={u.id}
                          name={u.name}
                          phone={u.phone}
                          role={u.role}
                          title={u.title}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  // Tab list is built per-role/permission, so a developer whose access an
  // admin hasn't granted simply never sees that tab (nor does its data get
  // fetched above).
  const tabs: DashboardTab[] = [];

  if (isAdmin) {
    tabs.push({
      id: "overview",
      label: "خلاصه‌ی وضعیت",
      panel: (
        <OverviewPanel
          stats={{
            customers: customers.length,
            team: teamMembers.length,
            inquiries: {
              total: inquiries.length,
              new: inquiries.filter((i) => i.status !== "followed_up").length,
              followedUp: inquiries.filter((i) => i.status === "followed_up").length,
            },
            tickets: {
              total: tickets.length,
              open: tickets.filter((t) => t.status === "open").length,
              closed: tickets.filter((t) => t.status !== "open").length,
            },
            crmLeads: {
              total: crmLeads.length,
              called: crmLeads.filter((l) => l.called).length,
              notCalled: crmLeads.filter((l) => !l.called).length,
            },
            tasks: {
              total: allTasks.length,
              open: allTasks.filter((t) => t.status === "open").length,
              done: allTasks.filter((t) => t.status === "done").length,
            },
            recentInquiries: inquiries.slice(0, 5),
            recentTickets: tickets.slice(0, 5),
          }}
        />
      ),
    });
  }

  if (isAdmin || perms.orders) {
    tabs.push({ id: "orders", label: `سفارش‌ها (${toPersianDigits(inquiries.length)})`, panel: ordersPanel });
  }
  if (isAdmin || perms.tickets) {
    tabs.push({ id: "tickets", label: `تیکت‌ها (${toPersianDigits(tickets.length)})`, panel: ticketsPanel });
  }
  if (isAdmin || perms.users) {
    tabs.push({ id: "users", label: `کاربران ثبت‌نامی (${toPersianDigits(customers.length)})`, panel: usersPanel });
  }
  if (isAdmin || perms.team) {
    tabs.push({ id: "team", label: `تیم برنامه‌نویسی (${toPersianDigits(teamMembers.length)})`, panel: teamPanel });
  }
  if (isAdmin) {
    tabs.push({
      id: "access",
      label: `دسترسی‌ها (${toPersianDigits(developers.length)})`,
      panel: (
        <AccessPanel
          developers={developers.map((d) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            permissions: getUserPermissions(d),
          }))}
        />
      ),
    });
  }
  if (isAdmin || perms.crm) {
    tabs.push({
      id: "crm",
      label: `CRM (${toPersianDigits(crmLeads.length)})`,
      panel: <CrmPanel leads={crmLeads} canDelete={isAdmin} />,
    });
  }
  if (isAdmin) {
    tabs.push({
      id: "tasks",
      label: `تسک‌ها (${toPersianDigits(allTasks.length)})`,
      panel: <AdminTasksPanel tasks={allTasks} developers={developers.map((d) => ({ id: d.id, name: d.name }))} />,
    });
  } else {
    tabs.push({
      id: "my-tasks",
      label: `تسک‌های من (${toPersianDigits(myTasks.filter((t) => t.status === "open").length)})`,
      panel: <MyTasksPanel tasks={myTasks} />,
    });
  }
  if (isAdmin || perms.chat) {
    tabs.push({
      id: "chat",
      label: "چت تیم",
      panel: <TeamChat initialMessages={teamMessages} currentUserId={currentUser.id} isAdmin={isAdmin} />,
    });
  }
  if (isAdmin || perms.blog) {
    tabs.push({
      id: "blog",
      label: `وبلاگ (${toPersianDigits(blogPosts.length)})`,
      panel: <BlogPanel posts={blogPosts} canDelete={isAdmin} />,
    });
  }

  // Nobody's been granted anything yet — shouldn't normally happen (every
  // developer defaults to team+chat) but guard against an empty tab bar.
  if (tabs.length === 0) {
    tabs.push({
      id: "empty",
      label: "داشبورد",
      panel: (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
          هنوز به این حساب دسترسی‌ای داده نشده — از یه ادمین بخواه از تب «تیم برنامه‌نویسی» برات دسترسی فعال کنه.
        </div>
      ),
    });
  }

  return (
    <>
      <Nav isLoggedIn />
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 lg:mb-10">
          <div className="min-w-0">
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-semibold text-dim transition hover:text-accent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px] rotate-180">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              بازگشت به صفحه اصلی
            </Link>
            <h1 className="font-display text-[26px] font-normal sm:text-[30px] lg:text-[34px]">داشبورد وب پیکاسو</h1>
          </div>
        </div>

        <DashboardTabs tabs={tabs} />
      </main>
    </>
  );
}
