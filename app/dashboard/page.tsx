import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
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
  getAllCrmCallLogs,
  getAllChannelLeads,
  getAllChannelMessageLogs,
  getUserPermissions,
  getAllBlogPosts,
  getAllProjects,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toPersianDigits } from "@/lib/auth";
import DashboardTabs, { type DashboardTab } from "./DashboardTabs";
import StaffLoginForm from "./StaffLoginForm";
import TeamChat from "./TeamChat";
import AddUserForm from "./AddUserForm";
import UserActions from "./UserActions";
import IdBadge from "./IdBadge";
import AccessPanel from "./AccessPanel";
import CrmPanel from "./CrmPanel";
import CrmReportPanel from "./CrmReportPanel";
import ChannelPanel from "./ChannelPanel";
import OrdersPanel from "./OrdersPanel";
import TicketsPanel from "./TicketsPanel";
import UsersPanel from "./UsersPanel";
import { AdminTasksPanel, MyTasksPanel } from "./TasksPanel";
import OverviewPanel from "./OverviewPanel";
import BlogPanel from "./BlogPanel";
import ProjectsPanel from "./ProjectsPanel";
import { formatDate } from "./format";

export const metadata = {
  title: "داشبورد — وب پیکاسو",
  robots: { index: false, follow: false },
};

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
  // Admin sees every lead in the CRM; a developer with "crm" access only
  // ever sees the numbers *they themselves* sourced — everyone's private
  // pipeline, not a shared pool visible to the whole team.
  const allCrmLeads = isAdmin || perms.crm ? await getAllCrmLeads() : [];
  const crmLeads = isAdmin ? allCrmLeads : allCrmLeads.filter((l) => l.created_by === currentUser.id);
  // Full call-outcome history, used to build the admin's daily activity
  // report — not needed (and not fetched) for non-admins.
  const crmCalls = isAdmin ? await getAllCrmCallLogs() : [];
  // Same pattern as CRM leads above, for pages/channels the team messages.
  const allChannelLeads = isAdmin || perms.channels ? await getAllChannelLeads() : [];
  const channelLeads = isAdmin ? allChannelLeads : allChannelLeads.filter((c) => c.created_by === currentUser.id);
  const channelMessages = isAdmin ? await getAllChannelMessageLogs() : [];
  const allTasks = isAdmin ? await getAllTasks() : [];
  const myTasks = !isAdmin ? await getTasksForUser(currentUser.id) : [];
  const blogPosts = isAdmin || perms.blog ? await getAllBlogPosts() : [];
  const projects = isAdmin || perms.projects ? await getAllProjects() : [];
  // Last message per ticket, for the one-line preview in the tickets list.
  const ticketLastMessages = await Promise.all(
    tickets.map(async (t) => {
      const msgs = await getTicketMessages(t.id);
      return msgs[msgs.length - 1];
    })
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
      <UsersPanel customers={customers} isAdmin={isAdmin} />
    </div>
  );

  const ordersPanel = <OrdersPanel inquiries={inquiries} isAdmin={isAdmin} />;

  const ticketsPanel = (
    <TicketsPanel tickets={tickets} ticketLastMessages={ticketLastMessages} isAdmin={isAdmin} />
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
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
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
    // So the admin's table can show "ثبت‌کننده" (who sourced each lead)
    // instead of a bare user id.
    const creatorNames = isAdmin
      ? Object.fromEntries(teamMembers.map((u) => [u.id, u.name]))
      : {};
    tabs.push({
      id: "crm",
      label: `CRM (${toPersianDigits(crmLeads.length)})`,
      panel: <CrmPanel leads={crmLeads} canDelete={isAdmin} creatorNames={creatorNames} />,
    });
  }
  if (isAdmin || perms.channels) {
    const channelCreatorNames = isAdmin
      ? Object.fromEntries(teamMembers.map((u) => [u.id, u.name]))
      : {};
    tabs.push({
      id: "channels",
      label: `پیام به کانال‌ها (${toPersianDigits(channelLeads.length)})`,
      panel: <ChannelPanel channels={channelLeads} canDelete={isAdmin} creatorNames={channelCreatorNames} />,
    });
  }
  if (isAdmin) {
    tabs.push({
      id: "crm-report",
      label: "گزارش فعالیت روزانه",
      panel: (
        <CrmReportPanel
          leads={allCrmLeads}
          calls={crmCalls}
          channels={allChannelLeads}
          channelMessages={channelMessages}
          users={teamMembers.map((u) => ({ id: u.id, name: u.name }))}
        />
      ),
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
  if (isAdmin || perms.projects) {
    tabs.push({
      id: "projects",
      label: `نمونه‌کارها (${toPersianDigits(projects.length)})`,
      panel: <ProjectsPanel projects={projects} />,
    });
  }

  // Nobody's been granted anything yet — shouldn't normally happen (every
  // developer defaults to team+chat) but guard against an empty tab bar.
  if (tabs.length === 0) {
    tabs.push({
      id: "empty",
      label: "داشبورد",
      panel: (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
          هنوز به این حساب دسترسی‌ای داده نشده — از یه ادمین بخواه از تب «تیم برنامه‌نویسی» برات دسترسی فعال کنه.
        </div>
      ),
    });
  }

  return (
    <>
      <Nav isLoggedIn />
      {/* `w-full` is load-bearing here, not decorative: <main> is a *direct
          child of <body>*, and body is `display:flex; flex-direction:column`
          (globals.css, for the sticky-footer trick). Per the flexbox spec,
          a flex item with auto margins on its cross axis (mx-auto = our
          horizontal margins, since the cross axis is horizontal in a
          column flex container) opts OUT of the default stretch behavior —
          it shrink-wraps to its content's intrinsic width instead of
          filling the row, no matter how wide the viewport is. That's what
          was squeezing every dashboard panel (chat, orders, tickets, CRM...)
          into a narrow column with a huge dead gap beside it on every
          screen size. Setting width explicitly to 100% (capped by
          max-w-[1440px]) sidesteps that shrink-to-fit path entirely. */}
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
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
