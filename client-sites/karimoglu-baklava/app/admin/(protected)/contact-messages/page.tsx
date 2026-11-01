import { Container } from "@/components/ui/Container";
import { requirePageAccess } from "@/lib/auth/adminGuard";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { listContactMessages, type ContactMessageStatusFilter } from "@/lib/server/contactRepo";
import { ContactMessageActions } from "@/components/admin/ContactMessageActions";

export const dynamic = "force-dynamic";

const statusLabels: Record<ContactMessageStatusFilter, string> = {
  new: "جدید",
  read: "خوانده‌شده",
  resolved: "رسیدگی‌شده",
  all: "همه",
};

/**
 * پیام‌های فرم تماس (صفحه عمومی /contact) — طبق درخواست مستقیم، اینجا
 * قابل مشاهده و مدیریت هستند. الگوی این صفحه دقیقاً همان الگوی
 * app/admin/(protected)/reviews/page.tsx است (فیلتر وضعیت + RBAC).
 */
export default async function AdminContactMessagesPage({
  searchParams,
}: {
  searchParams: { status?: ContactMessageStatusFilter };
}) {
  const access = await requirePageAccess("contact.manage");
  if (!access.allowed) return <AccessDenied />;

  const status = searchParams.status ?? "new";
  const messages = await listContactMessages(status);

  return (
    <Container className="flex flex-col gap-6 py-2">
      <div>
        <h1 className="text-h2 text-text-primary">پیام‌های تماس با ما</h1>
        <p className="text-bodySm text-text-secondary">پیام‌های ارسال‌شده از فرم تماس در سایت.</p>
      </div>

      <div className="flex gap-2">
        {(["new", "read", "resolved", "all"] as const).map((s) => (
          <a
            key={s}
            href={`/admin/contact-messages?status=${s}`}
            className={`rounded-full px-3 py-1 text-caption ${
              status === s ? "bg-brand-black text-white" : "border border-border-strong text-text-secondary"
            }`}
          >
            {statusLabels[s]}
          </a>
        ))}
      </div>

      {messages.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center text-bodySm text-text-muted shadow-sm">
          پیامی در این بخش نیست.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-lg bg-surface p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-bodySm text-text-primary">
                  {m.name} ·{" "}
                  <a href={`tel:${m.mobile}`} dir="ltr" className="text-brand-red hover:underline">
                    {m.mobile}
                  </a>
                </p>
                <ContactMessageActions id={m.id} status={m.status} />
              </div>
              <p className="text-bodySm text-text-secondary">{m.message}</p>
              <p className="mt-1 text-caption text-text-muted">
                {new Date(m.createdAt).toLocaleString("fa-IR")} · وضعیت: {statusLabels[m.status]}
              </p>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
