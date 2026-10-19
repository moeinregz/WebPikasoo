"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MAIN_ADMIN_PHONE } from "@/lib/crmAccess";
import { CRM_ACCEPT_RESULT } from "@/lib/crmReport";
import { autoBuildSiteForLead } from "@/lib/crmSite";
import { buildPrivateSite } from "@/lib/siteTemplates/publish";
import {
  getUserByPhone,
  getUserById,
  sendTeamMessage,
  getTeamMessages,
  getTeamMessageOwner,
  deleteTeamMessage,
  addTicketMessage,
  getTicketById,
  closeTicket,
  reopenTicket,
  deleteTicket,
  createUser,
  setUserRole,
  updateUser,
  deleteUser,
  setUserPermissions,
  createCrmLead,
  getCrmLeadByPhone,
  getCrmLeadById,
  setCrmLeadCalled,
  recordCrmCallResult,
  deleteCrmLead,
  updateCrmLead,
  createChannelLead,
  setChannelLeadMessaged,
  recordChannelMessageResult,
  deleteChannelLead,
  createTask,
  setTaskStatus,
  deleteTask,
  getTasksForUser,
  deleteInquiry,
  setInquiryStatus,
  createProject,
  deleteProject,
  createPrivateSite,
  deletePrivateSite,
  getPrivateSiteById,
  getInquiryById,
  clockIn,
  clockOut,
  getAttendanceById,
  insertAttendanceManual,
  updateAttendance,
  deleteAttendance,
  setWorkHours,
  insertWorkReport,
  updateWorkReport,
  deleteWorkReport,
  getWorkReportById,
  setWorkReportStatus,
  setWorkReportFeedback,
  insertManualOrder,
  updateManualOrder,
  setPrivateSiteImage,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  setBlogPostPublished,
  getBlogPostById,
  getBlogPostBySlug,
  type TeamMessage,
  type UserRole,
  type UserPermissions,
} from "@/lib/db";
import { verifyPassword, hashPassword, isValidPhone, normalizePhone, toPersianDigits } from "@/lib/auth";
import { setSessionCookie, getCurrentUser, USER_COOKIE_NAME } from "@/lib/session";
import {
  saveChatAttachment,
  saveBlogImage,
  saveProjectImage,
  saveProjectHtmlFile,
  savePrivateSiteHtmlFile,
  savePrivateSiteImage,
  deleteBlobQuietly,
} from "@/lib/uploads";
import { slugify, isValidSlug } from "@/lib/slug";
import { getTrade } from "@/lib/siteTemplates/trades";
import { imageSlotsFor, pickTemplate, templateIdOfSite } from "@/lib/siteTemplates";
import type { ManualOrderData, WorkReportData } from "@/lib/db";
import { isDayString, isTimeString, shiftDay, tehranDay, tehranToUtc } from "@/lib/attendance";
import {
  toEn,
  HEX_COLOR,
  normalizeInstagram,
  whatsappNumber,
} from "@/lib/siteTemplates/generate";
import { cookies } from "next/headers";

export type DashboardFormState = {
  ok: boolean;
  message: string;
} | null;

/** Staff login for /dashboard. There's no separate admin password anymore —
 *  this checks the exact same `users` table as the customer login on
 *  /account, it just additionally requires role 'admin' or 'developer'.
 *  A customer's own phone/password will authenticate fine but gets turned
 *  away here (with a message pointing them to /account instead), since a
 *  correct login doesn't by itself mean dashboard access. */
export async function staffLogin(
  _prevState: DashboardFormState,
  formData: FormData
): Promise<DashboardFormState> {
  const phoneRaw = (formData.get("phone") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  if (!phoneRaw || !password) {
    return { ok: false, message: "شماره تماس و رمز عبور رو وارد کن." };
  }
  if (!isValidPhone(phoneRaw)) {
    return { ok: false, message: "شماره یا رمز عبور اشتباهه." };
  }

  const phone = normalizePhone(phoneRaw);
  const user = await getUserByPhone(phone);

  if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
    return { ok: false, message: "شماره یا رمز عبور اشتباهه." };
  }

  if (user.role !== "admin" && user.role !== "developer") {
    return {
      ok: false,
      message: "این حساب دسترسی داشبورد تیم رو نداره — برای حساب مشتری از /account وارد شو.",
    };
  }

  setSessionCookie(user.id);
  redirect("/dashboard");
}

export async function logout() {
  cookies().delete(USER_COOKIE_NAME);
  redirect("/dashboard");
}

/** Server-action wrapper around getTeamMessages, callable straight from the
 *  TeamChat client component (for polling). Re-checks staff membership on
 *  every call — never trust the client just because it rendered the chat. */
export async function getTeamMessagesAction(): Promise<TeamMessage[]> {
  const user = await getCurrentUser();
  if (!user || !user.isStaff) return [];
  return getTeamMessages();
}

/** Admins can delete any team-chat message; everyone else can only delete
 *  their own. Re-checks both staff membership and ownership server-side —
 *  the delete button's visibility on the client is just a convenience, not
 *  the actual guard. */
export async function deleteTeamMessageAction(formData: FormData): Promise<DashboardFormState> {
  const user = await getCurrentUser();
  if (!user || !user.isStaff) {
    return { ok: false, message: "اجازه‌ی این کار رو نداری." };
  }

  const messageId = Number(formData.get("messageId"));
  if (!messageId) {
    return { ok: false, message: "پیام پیدا نشد." };
  }

  const message = await getTeamMessageOwner(messageId);
  if (!message) {
    return { ok: false, message: "پیام قبلاً حذف شده." };
  }

  if (!user.isAdmin && message.user_id !== user.id) {
    return { ok: false, message: "فقط می‌تونی پیام خودت رو پاک کنی." };
  }

  await deleteTeamMessage(messageId);
  return { ok: true, message: "پیام حذف شد." };
}

export async function sendTeamMessageAction(formData: FormData): Promise<DashboardFormState> {
  const user = await getCurrentUser();
  if (!user || !user.isStaff) {
    return { ok: false, message: "فقط اعضای تیم به این چت دسترسی دارن." };
  }
  if (!user.permissions.chat) {
    return { ok: false, message: "دسترسی چت برای حساب تو غیرفعاله." };
  }

  const message = (formData.get("message") ?? "").toString().trim();
  if (message.length > 2000) return { ok: false, message: "پیام خیلی طولانیه." };

  const file = formData.get("attachment");
  let attachment: { url: string; type: string; name: string } | null = null;
  if (file instanceof File && file.size > 0) {
    try {
      attachment = await saveChatAttachment(file);
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : "آپلود فایل ناموفق بود." };
    }
  }

  if (!message && !attachment) return { ok: false, message: "یه پیام بنویس یا فایل/ویس بفرست." };

  await sendTeamMessage({
    userId: user.id,
    message,
    attachmentUrl: attachment?.url,
    attachmentType: attachment?.type,
    attachmentName: attachment?.name,
  });
  revalidatePath("/dashboard");
  return { ok: true, message: "" };
}

// --- Ticket handling (admin, or a developer granted the tickets perm) ------
// Plain (non-useFormState) actions: each ticket renders its own tiny form
// with the ticket id as a hidden field, and the page just re-renders with
// fresh data afterward — there's no per-field validation UI to drive.

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }
  return user;
}

/** Admin always qualifies; a developer only if an admin has granted them
 *  the "tickets" permission from the team tab. */
async function requireTicketAccess() {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !(user.role === "admin" || user.permissions.tickets)) {
    redirect("/dashboard");
  }
  return user;
}

/** Admin always qualifies; a developer only if an admin has granted them
 *  the "blog" permission from the access tab. */
async function requireBlogAccess() {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !(user.role === "admin" || user.permissions.blog)) {
    redirect("/dashboard");
  }
  return user;
}

/** Admin always qualifies; a developer only if an admin has granted them
 *  the "crm" permission from the access tab. */
async function requireCrmAccess() {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !(user.role === "admin" || user.permissions.crm)) {
    redirect("/dashboard");
  }
  return user;
}

// The one account allowed to edit an existing lead's classification
// (business area/type, problem status) after the fact — deliberately
// narrower than "admin": there can be more than one admin account, but
// this stays locked to a single phone number regardless of role.
async function requireCrmOwner() {
  const user = await requireCrmAccess();
  if (user.phone !== MAIN_ADMIN_PHONE) {
    redirect("/dashboard");
  }
  return user;
}

/** Admin always qualifies; a developer only if an admin has granted them
 *  the "channels" permission from the access tab. */
async function requireChannelsAccess() {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !(user.role === "admin" || user.permissions.channels)) {
    redirect("/dashboard");
  }
  return user;
}

/** Admin always qualifies; a developer only if an admin has granted them
 *  the "projects" permission from the access tab. */
async function requireProjectsAccess() {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !(user.role === "admin" || user.permissions.projects)) {
    redirect("/dashboard");
  }
  return user;
}

/** Adds one message to a ticket's thread — replaces the old single-"reply"
 *  design where a second answer silently erased the first one. Doesn't
 *  close the ticket by itself; use closeTicketAction for that, so staff can
 *  send a few messages back and forth before marking it resolved. */
export async function replyToTicketAction(formData: FormData) {
  const user = await requireTicketAccess();
  const ticketId = Number(formData.get("ticketId"));
  const reply = (formData.get("message") ?? "").toString().trim();
  if (!ticketId || !reply || reply.length > 4000) return;
  if (!(await getTicketById(ticketId))) return;

  await addTicketMessage({
    ticketId,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role === "admin" ? "admin" : "developer",
    message: reply,
  });
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/account");
  revalidatePath(`/account/tickets/${ticketId}`);
}

export async function closeTicketAction(formData: FormData) {
  await requireTicketAccess();
  const ticketId = Number(formData.get("ticketId"));
  if (!ticketId) return;

  await closeTicket(ticketId);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/account");
  revalidatePath(`/account/tickets/${ticketId}`);
}

export async function reopenTicketAction(formData: FormData) {
  await requireTicketAccess();
  const ticketId = Number(formData.get("ticketId"));
  if (!ticketId) return;

  await reopenTicket(ticketId);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/account");
  revalidatePath(`/account/tickets/${ticketId}`);
}

/** Admin-only (not just "has the tickets permission") — a developer who can
 *  reply to/close tickets still can't delete one. */
export async function deleteTicketAction(formData: FormData) {
  await requireAdmin();
  const ticketId = Number(formData.get("ticketId"));
  if (!ticketId) return;

  await deleteTicket(ticketId);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/account");
  redirect("/dashboard");
}

// --- Admin adding a user directly from the dashboard ------------------------
// Previously the only way to create staff (developer/admin) accounts was a
// one-off Node script. This lets an admin create any account — customer,
// developer, or admin — from the "تیم برنامه‌نویسی" tab instead.

export type CreateUserFormState = { ok: boolean; message: string } | null;

export async function createUserAction(
  _prevState: CreateUserFormState,
  formData: FormData
): Promise<CreateUserFormState> {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.isStaff) {
    return { ok: false, message: "اجازه‌ی این کار رو نداری." };
  }
  const isAdmin = currentUser.role === "admin";
  // A developer only gets here via the "کاربران ثبت‌نامی" tab's add-form,
  // which is granted by the "users" permission — and even then can only
  // add plain customers, never promote anyone to developer/admin.
  if (!isAdmin && !currentUser.permissions.users) {
    return { ok: false, message: "اجازه‌ی این کار رو نداری." };
  }

  const name = (formData.get("name") ?? "").toString().trim();
  const phoneRaw = (formData.get("phone") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const role = isAdmin ? ((formData.get("role") ?? "customer").toString() as UserRole) : "customer";
  const title = (formData.get("title") ?? "").toString().trim();

  if (!name || !phoneRaw || !password) {
    return { ok: false, message: "نام، شماره موبایل و رمز عبور رو پر کن." };
  }
  if (name.length > 120) {
    return { ok: false, message: "نام خیلی طولانیه." };
  }
  if (!["customer", "developer", "admin"].includes(role)) {
    return { ok: false, message: "نقش انتخاب‌شده معتبر نیست." };
  }
  if (!isValidPhone(phoneRaw)) {
    return { ok: false, message: "شماره موبایل معتبر نیست — مثل ۰۹۱۲۳۴۵۶۷۸۹ وارد کن." };
  }
  if (password.length < 6) {
    return { ok: false, message: "رمز عبور باید حداقل ۶ کاراکتر باشه." };
  }

  const phone = normalizePhone(phoneRaw);
  if (await getUserByPhone(phone)) {
    return { ok: false, message: "این شماره قبلاً تو سیستم ثبت شده." };
  }

  let newUserId: number;
  try {
    const { hash, salt } = hashPassword(password);
    newUserId = await createUser({ name, phone, passwordHash: hash, passwordSalt: salt, title });
    if (role !== "customer") {
      await setUserRole(newUserId, role);
    }
  } catch (err) {
    console.error("createUserAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  revalidatePath("/dashboard");
  return {
    ok: true,
    message: `کاربر با موفقیت اضافه شد — شناسه‌ی کاربری: ${toPersianDigits(newUserId)}`,
  };
}

// --- Admin editing / deleting a user ----------------------------------------

export type EditUserFormState = { ok: boolean; message: string } | null;

export async function updateUserAction(
  _prevState: EditUserFormState,
  formData: FormData
): Promise<EditUserFormState> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { ok: false, message: "فقط ادمین می‌تونه کاربر رو ویرایش کنه." };
  }

  const userId = Number(formData.get("userId"));
  const name = (formData.get("name") ?? "").toString().trim();
  const phoneRaw = (formData.get("phone") ?? "").toString().trim();
  const role = (formData.get("role") ?? "customer").toString() as UserRole;
  const password = (formData.get("password") ?? "").toString();
  const title = (formData.get("title") ?? "").toString().trim();

  if (!userId || !name || !phoneRaw) {
    return { ok: false, message: "نام و شماره موبایل رو پر کن." };
  }
  if (!["customer", "developer", "admin"].includes(role)) {
    return { ok: false, message: "نقش انتخاب‌شده معتبر نیست." };
  }
  if (!isValidPhone(phoneRaw)) {
    return { ok: false, message: "شماره موبایل معتبر نیست." };
  }
  if (password && password.length < 6) {
    return { ok: false, message: "رمز عبور جدید باید حداقل ۶ کاراکتر باشه." };
  }

  const phone = normalizePhone(phoneRaw);
  const existing = await getUserByPhone(phone);
  if (existing && existing.id !== userId) {
    return { ok: false, message: "این شماره برای کاربر دیگه‌ای ثبت شده." };
  }

  try {
    if (password) {
      const { hash, salt } = hashPassword(password);
      await updateUser(userId, { name, phone, role, passwordHash: hash, passwordSalt: salt, title });
    } else {
      await updateUser(userId, { name, phone, role, title });
    }
  } catch (err) {
    console.error("updateUserAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "تغییرات ذخیره شد." };
}

export async function deleteUserAction(formData: FormData) {
  const currentUser = await requireAdmin();
  const userId = Number(formData.get("userId"));
  if (!userId) return;
  if (userId === currentUser.id) return; // can't delete your own logged-in account

  await deleteUser(userId);
  revalidatePath("/dashboard");
}

// --- Admin setting per-developer permissions ---------------------------------

export async function setUserPermissionsAction(formData: FormData) {
  await requireAdmin();
  const userId = Number(formData.get("userId"));
  if (!userId) return;

  const permissions: UserPermissions = {
    tickets: formData.get("perm_tickets") === "on",
    users: formData.get("perm_users") === "on",
    team: formData.get("perm_team") === "on",
    chat: formData.get("perm_chat") === "on",
    orders: formData.get("perm_orders") === "on",
    blog: formData.get("perm_blog") === "on",
    crm: formData.get("perm_crm") === "on",
    projects: formData.get("perm_projects") === "on",
    channels: formData.get("perm_channels") === "on",
    attendance: formData.get("perm_attendance") === "on",
  };

  await setUserPermissions(userId, permissions);
  revalidatePath("/dashboard");
}

// --- Orders ("سفارش‌ها" — the homepage contact-form inquiries) ---------------
// --- Orders -----------------------------------------------------------------

/** Admin always qualifies; a developer only with the "orders" permission. */
async function requireOrdersAccess() {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !(user.role === "admin" || user.permissions.orders)) {
    redirect("/dashboard");
  }
  return user;
}

/** Who may change an existing order: an admin (any), or the staff member who
 *  registered a manual order (only their own). Contact-form inquiries stay
 *  admin-only, exactly as before. */
async function requireOrderManager(id: number) {
  const user = await requireOrdersAccess();
  const inq = await getInquiryById(id);
  if (!inq) return { user, inq: null };
  const ownsIt = inq.source === "manual" && inq.created_by === user.id;
  if (user.role !== "admin" && !ownsIt) redirect("/dashboard");
  return { user, inq };
}

export async function markInquiryFollowedUpAction(formData: FormData) {
  const id = Number(formData.get("inquiryId"));
  if (!id) return;
  const { inq } = await requireOrderManager(id);
  if (!inq) return;
  const status = formData.get("status") === "followed_up" ? "followed_up" : "new";

  await setInquiryStatus(id, status);
  revalidatePath("/dashboard");
}

export async function deleteInquiryAction(formData: FormData) {
  const id = Number(formData.get("inquiryId"));
  if (!id) return;
  const { inq } = await requireOrderManager(id);
  if (!inq) return;

  await deleteInquiry(id);
  revalidatePath("/dashboard");
}

export type ManualOrderFormState = { ok: boolean; message: string } | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAYMENT_STATUSES = ["unpaid", "deposit", "paid"] as const;

/** Reads + validates the manual-order form (shared by create and edit). */
function parseManualOrder(formData: FormData): { ok: true; data: ManualOrderData } | { ok: false; message: string } {
  const get = (k: string) => (formData.get(k) ?? "").toString().trim();
  const name = get("name");
  const phoneRaw = get("phone");
  const message = get("message");
  const email = get("email");
  const phone2Raw = get("phone2");

  if (!name || !phoneRaw || !message) {
    return { ok: false, message: "نام مشتری، شماره‌ی تماس و شرح سفارش اجباریه." };
  }
  if (!isValidPhone(phoneRaw)) return { ok: false, message: "شماره‌ی تماس معتبر نیست." };
  if (phone2Raw && !isValidPhone(phone2Raw)) return { ok: false, message: "شماره‌ی دوم معتبر نیست." };
  if (email && !EMAIL_PATTERN.test(email)) return { ok: false, message: "ایمیل معتبر نیست." };

  const limits: [string, number][] = [
    [name, 120], [get("businessName"), 160], [email, 160], [get("city"), 80], [get("instagram"), 120],
    [get("channel"), 60], [get("projectType"), 120], [get("agreedPrice"), 80], [get("deposit"), 80],
    [get("deliveryDate"), 60], [message, 4000], [get("notes"), 4000],
  ];
  if (limits.some(([v, max]) => v.length > max)) return { ok: false, message: "یکی از فیلدها خیلی طولانیه." };

  const ps = get("paymentStatus");
  const paymentStatus = (PAYMENT_STATUSES as readonly string[]).includes(ps)
    ? (ps as (typeof PAYMENT_STATUSES)[number])
    : "unpaid";

  return {
    ok: true,
    data: {
      name,
      phone: normalizePhone(phoneRaw),
      message,
      email,
      businessName: get("businessName"),
      phone2: phone2Raw ? normalizePhone(phone2Raw) : "",
      city: get("city"),
      instagram: get("instagram"),
      channel: get("channel"),
      projectType: get("projectType"),
      agreedPrice: get("agreedPrice"),
      deposit: get("deposit"),
      paymentStatus,
      deliveryDate: get("deliveryDate"),
      notes: get("notes"),
    },
  };
}

/** A sales expert (or admin) registers an order taken outside the site. It is
 *  stored against their account and shown only to them (and admins). */
export async function createManualOrderAction(
  _prevState: ManualOrderFormState,
  formData: FormData
): Promise<ManualOrderFormState> {
  const user = await requireOrdersAccess();
  const parsed = parseManualOrder(formData);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  try {
    await insertManualOrder(parsed.data, user.id);
  } catch (err) {
    console.error("createManualOrderAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }
  revalidatePath("/dashboard");
  return { ok: true, message: "سفارش ثبت شد." };
}

export async function updateManualOrderAction(
  _prevState: ManualOrderFormState,
  formData: FormData
): Promise<ManualOrderFormState> {
  const id = Number(formData.get("inquiryId"));
  if (!id) return { ok: false, message: "شناسه‌ی سفارش نامعتبره." };
  const { inq } = await requireOrderManager(id);
  if (!inq || inq.source !== "manual") return { ok: false, message: "سفارش پیدا نشد." };

  const parsed = parseManualOrder(formData);
  if (!parsed.ok) return { ok: false, message: parsed.message };
  try {
    await updateManualOrder(id, parsed.data);
  } catch (err) {
    console.error("updateManualOrderAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }
  revalidatePath("/dashboard");
  return { ok: true, message: "سفارش به‌روزرسانی شد." };
}

// --- Attendance (ورود و خروج) + daily work reports --------------------------

/** Staff (not customers) with the "attendance" permission. */
async function requireAttendanceAccess() {
  const user = await getCurrentUser();
  if (!user || !user.isStaff || !(user.role === "admin" || user.permissions.attendance)) {
    redirect("/dashboard");
  }
  return user;
}

export type ClockState = { ok: boolean; message: string } | null;

export async function clockInAction(_prev: ClockState, _formData: FormData): Promise<ClockState> {
  const user = await requireAttendanceAccess();
  try {
    const res = await clockIn(user.id);
    revalidatePath("/dashboard");
    return res;
  } catch (err) {
    console.error("clockInAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کنید." };
  }
}

export async function clockOutAction(_prev: ClockState, _formData: FormData): Promise<ClockState> {
  const user = await requireAttendanceAccess();
  try {
    const res = await clockOut(user.id);
    revalidatePath("/dashboard");
    return res;
  } catch (err) {
    console.error("clockOutAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کنید." };
  }
}

export type AttendanceFormState = { ok: boolean; message: string } | null;

/** Admin: set the official work hours (used for the late / early flags). */
export async function setWorkHoursAction(_prev: AttendanceFormState, formData: FormData): Promise<AttendanceFormState> {
  await requireAdmin();
  const start = (formData.get("start") ?? "").toString();
  const end = (formData.get("end") ?? "").toString();
  if (!isTimeString(start) || !isTimeString(end)) return { ok: false, message: "ساعت‌ها معتبر نیستن." };
  if (start >= end) return { ok: false, message: "ساعت پایان باید بعد از ساعت شروع باشه." };
  await setWorkHours({ start, end });
  revalidatePath("/dashboard");
  return { ok: true, message: "ساعت کاری ذخیره شد." };
}

/** Admin: add a missed shift by hand, or correct an existing record. */
export async function saveAttendanceAction(_prev: AttendanceFormState, formData: FormData): Promise<AttendanceFormState> {
  const admin = await requireAdmin();
  const id = Number(formData.get("recordId")) || 0;
  const day = (formData.get("day") ?? "").toString();
  const inTime = (formData.get("checkIn") ?? "").toString();
  const outTime = (formData.get("checkOut") ?? "").toString();

  if (!isDayString(day) || day > shiftDay(tehranDay(), 1)) return { ok: false, message: "تاریخ معتبر نیست." };
  if (!isTimeString(inTime)) return { ok: false, message: "ساعت ورود معتبر نیست." };
  if (outTime && !isTimeString(outTime)) return { ok: false, message: "ساعت خروج معتبر نیست." };
  const checkIn = tehranToUtc(day, inTime);
  const checkOut = outTime ? tehranToUtc(day, outTime) : null;
  if (checkOut && checkOut <= checkIn) return { ok: false, message: "ساعت خروج باید بعد از ورود باشه." };

  try {
    if (id) {
      if (!(await getAttendanceById(id))) return { ok: false, message: "رکورد پیدا نشد." };
      await updateAttendance(id, { day, checkIn, checkOut }, admin.id);
    } else {
      const userId = Number(formData.get("userId"));
      if (!userId) return { ok: false, message: "کارشناس رو انتخاب کنید." };
      await insertAttendanceManual(userId, day, checkIn, checkOut, admin.id);
    }
  } catch (err) {
    console.error("saveAttendanceAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کنید." };
  }
  revalidatePath("/dashboard");
  return { ok: true, message: id ? "رکورد اصلاح شد." : "رکورد اضافه شد." };
}

export async function deleteAttendanceAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("recordId"));
  if (!id) return;
  await deleteAttendance(id);
  revalidatePath("/dashboard");
}

export type ReportFormState = { ok: boolean; message: string } | null;

const toEnDigits = (v: string) => v.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

function parseWorkReport(formData: FormData): { ok: true; data: WorkReportData } | { ok: false; message: string } {
  const get = (k: string) => (formData.get(k) ?? "").toString().trim();
  const today = tehranDay();
  const day = get("day") || today;
  const summary = get("summary");

  if (!isDayString(day)) return { ok: false, message: "تاریخ گزارش معتبر نیست." };
  if (day > today) return { ok: false, message: "برای روزهای آینده نمی‌شه گزارش ثبت کرد." };
  if (day < shiftDay(today, -14)) return { ok: false, message: "گزارش برای بیش از ۱۴ روز پیش قابل ثبت نیست." };
  if (summary.length < 10) return { ok: false, message: "لطفاً شرح کارهای انجام‌شده رو کمی کامل‌تر بنویسید." };

  const calls = toEnDigits(get("calls"));
  const orders = toEnDigits(get("orders"));
  if ((calls && !/^\d{1,5}$/.test(calls)) || (orders && !/^\d{1,5}$/.test(orders))) {
    return { ok: false, message: "تعداد تماس و سفارش باید عدد باشه." };
  }
  const revenue = get("revenue"), issues = get("issues"), tomorrow = get("tomorrow");
  if (summary.length > 4000 || issues.length > 4000 || tomorrow.length > 4000 || revenue.length > 80) {
    return { ok: false, message: "یکی از فیلدها خیلی طولانیه." };
  }
  return { ok: true, data: { day, summary, calls, orders, revenue, issues, tomorrow } };
}

/** A staff member sends today's (or a recent day's) work report to the admin. */
export async function submitWorkReportAction(_prev: ReportFormState, formData: FormData): Promise<ReportFormState> {
  const user = await requireAttendanceAccess();
  const parsed = parseWorkReport(formData);
  if (!parsed.ok) return { ok: false, message: parsed.message };
  try {
    await insertWorkReport(user.id, parsed.data);
  } catch (err) {
    console.error("submitWorkReportAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کنید." };
  }
  revalidatePath("/dashboard");
  return { ok: true, message: "گزارش برای مدیر ارسال شد." };
}

/** The sender can fix or withdraw a report only until the admin has read it. */
async function requireOwnUnreadReport(id: number) {
  const user = await requireAttendanceAccess();
  const report = await getWorkReportById(id);
  if (!report || report.user_id !== user.id || report.status !== "new") return { user, report: null };
  return { user, report };
}

export async function updateWorkReportAction(_prev: ReportFormState, formData: FormData): Promise<ReportFormState> {
  const id = Number(formData.get("reportId"));
  if (!id) return { ok: false, message: "گزارش پیدا نشد." };
  const { report } = await requireOwnUnreadReport(id);
  if (!report) return { ok: false, message: "این گزارش دیگه قابل ویرایش نیست (مدیر خونده)." };
  const parsed = parseWorkReport(formData);
  if (!parsed.ok) return { ok: false, message: parsed.message };
  await updateWorkReport(id, parsed.data);
  revalidatePath("/dashboard");
  return { ok: true, message: "گزارش به‌روزرسانی شد." };
}

export async function deleteWorkReportAction(formData: FormData) {
  const id = Number(formData.get("reportId"));
  if (!id) return;
  const user = await requireAttendanceAccess();
  const report = await getWorkReportById(id);
  if (!report) return;
  // Admin may remove any report; a sender only their own unread one.
  if (user.role !== "admin" && !(report.user_id === user.id && report.status === "new")) return;
  await deleteWorkReport(id);
  revalidatePath("/dashboard");
}

export async function markWorkReportAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("reportId"));
  if (!id) return;
  await setWorkReportStatus(id, formData.get("status") === "new" ? "new" : "read");
  revalidatePath("/dashboard");
}

export async function saveReportFeedbackAction(_prev: ReportFormState, formData: FormData): Promise<ReportFormState> {
  await requireAdmin();
  const id = Number(formData.get("reportId"));
  const feedback = (formData.get("feedback") ?? "").toString().trim();
  if (!id || feedback.length > 2000) return { ok: false, message: "بازخورد معتبر نیست." };
  if (!(await getWorkReportById(id))) return { ok: false, message: "گزارش پیدا نشد." };
  await setWorkReportFeedback(id, feedback);
  revalidatePath("/dashboard");
  return { ok: true, message: feedback ? "بازخورد ذخیره شد." : "بازخورد پاک شد." };
}

// --- Portfolio projects (admin-manageable, shown in the homepage showcase) --

export type ProjectFormState = { ok: boolean; message: string } | null;

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireProjectsAccess();

  const name = (formData.get("name") ?? "").toString().trim();
  const category = (formData.get("category") ?? "").toString().trim();
  const description = (formData.get("description") ?? "").toString().trim();
  const siteUrl = (formData.get("siteUrl") ?? "").toString().trim();

  if (!name || !category) {
    return { ok: false, message: "عنوان و دسته‌بندی رو پر کن." };
  }

  // The "site" field is one of two things: an uploaded .html file (shown
  // on our own domain via /portfolio/view/[id]) or a plain link that sends
  // the visitor to that project's own domain. Exactly one is required.
  const siteFile = formData.get("siteFile");
  const hasSiteFile = siteFile instanceof File && siteFile.size > 0;

  if (!hasSiteFile && !siteUrl) {
    return { ok: false, message: "یا فایل HTML رو آپلود کن یا لینک سایت رو وارد کن." };
  }
  if (hasSiteFile && siteUrl) {
    return { ok: false, message: "فقط یکی از این دو رو پر کن: فایل HTML یا لینک سایت، نه هر دو." };
  }

  try {
    let url: string;
    let linkType: "url" | "html";
    if (hasSiteFile) {
      const savedHtml = await saveProjectHtmlFile(siteFile as File);
      if (!savedHtml) {
        return { ok: false, message: "آپلود فایل HTML ناموفق بود، دوباره امتحان کن." };
      }
      url = savedHtml;
      linkType = "html";
    } else {
      url = siteUrl;
      linkType = "url";
    }

    let image = "";
    const imageFile = formData.get("image");
    if (imageFile instanceof File && imageFile.size > 0) {
      image = (await saveProjectImage(imageFile)) || "";
    }

    await createProject({ name, category, url, image, description, linkType });
  } catch (err) {
    const message = err instanceof Error ? err.message : "یه مشکلی پیش اومد، دوباره امتحان کن.";
    console.error("createProjectAction failed:", err);
    return { ok: false, message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/portfolio");
  return { ok: true, message: "نمونه‌کار اضافه شد." };
}

export async function deleteProjectAction(formData: FormData) {
  await requireProjectsAccess();
  const id = Number(formData.get("projectId"));
  if (!id) return;

  await deleteProject(id);
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/portfolio");
}

// --- Private site previews (admin only, NOT shown in the portfolio) --------

export type PrivateSiteFormState = { ok: boolean; message: string; link?: string } | null;

export async function createPrivateSiteAction(
  _prevState: PrivateSiteFormState,
  formData: FormData
): Promise<PrivateSiteFormState> {
  await requireAdmin();

  const name = (formData.get("name") ?? "").toString().trim();
  const note = (formData.get("note") ?? "").toString().trim();
  const file = formData.get("siteFile");

  if (!name) return { ok: false, message: "یه اسم برای این سایت بنویس (فقط برای خودته)." };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایل HTML رو انتخاب کن." };
  }

  try {
    const url = await savePrivateSiteHtmlFile(file);
    if (!url) return { ok: false, message: "آپلود فایل ناموفق بود، دوباره امتحان کن." };
    const site = await createPrivateSite({ name, note, url });
    revalidatePath("/dashboard");
    return { ok: true, message: "سایت آپلود شد. لینکش آماده‌ست.", link: `/preview/${site.token}` };
  } catch (err) {
    console.error("createPrivateSiteAction failed:", err);
    return { ok: false, message: err instanceof Error ? err.message : "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }
}

/** Builds a demo site from one of the pre-made templates of the chosen trade
 *  (brand, address, 1–3 phones, optional hours, optional colors), stores it
 *  as a private site and returns its /preview link. Costs no AI tokens. */
export async function generateSiteAction(
  _prevState: PrivateSiteFormState,
  formData: FormData
): Promise<PrivateSiteFormState> {
  await requireAdmin();

  const str = (key: string) => (formData.get(key) ?? "").toString().trim();
  const trade = getTrade(str("trade"));
  const brand = str("brand");
  const address = str("address");
  const hours = str("hours");
  const phones = formData
    .getAll("phone")
    .map((v) => v.toString().trim())
    .filter(Boolean)
    .slice(0, 3);
  const primary = str("color1");
  const secondary = str("color2");
  const instagram = str("instagram");
  const whatsapp = str("whatsapp");

  if (!trade) return { ok: false, message: "صنف رو انتخاب کن." };
  if (!brand) return { ok: false, message: "اسم برند رو بنویس." };
  if (brand.length > 80 || address.length > 300 || hours.length > 200) {
    return { ok: false, message: "یکی از فیلدها خیلی طولانیه." };
  }
  if (!address) return { ok: false, message: "آدرس رو بنویس." };
  if (phones.length === 0) return { ok: false, message: "حداقل یک شماره تماس وارد کن." };
  if (phones.some((p) => !/^[0-9+\-\s()]{5,20}$/.test(toEn(p)))) {
    return { ok: false, message: "یکی از شماره‌ها معتبر نیست." };
  }
  if ((primary && !HEX_COLOR.test(primary)) || (secondary && !HEX_COLOR.test(secondary))) {
    return { ok: false, message: "رنگ نامعتبره." };
  }
  if (instagram && !normalizeInstagram(instagram)) {
    return { ok: false, message: "آیدی اینستاگرام معتبر نیست (مثلاً cafe_omid@ یا لینک پیج)." };
  }
  if (whatsapp && !whatsappNumber(whatsapp)) {
    return { ok: false, message: "شماره‌ی واتساپ معتبر نیست." };
  }

  const template = pickTemplate(trade.id, str("template") || undefined);
  if (!template) {
    return { ok: false, message: `برای صنف «${trade.label}» هنوز قالبی اضافه نشده.` };
  }

  try {
    const { site } = await buildPrivateSite({
      template,
      input: {
        brand,
        address,
        phones,
        hours,
        primary: primary || undefined,
        secondary: secondary || undefined,
        instagram: instagram || undefined,
        whatsapp: whatsapp || undefined,
      },
    });
    revalidatePath("/dashboard");
    return {
      ok: true,
      message:
        "سایت ساخته شد. لینکش آماده‌ست." +
        (imageSlotsFor(template.id).length > 0 ? " این قالب جای عکس داره؛ از تب «سایت‌های خصوصی» عکس‌هاش رو آپلود کن." : ""),
      link: `/preview/${site.token}`,
    };
  } catch (err) {
    console.error("generateSiteAction failed:", err);
    return { ok: false, message: err instanceof Error ? err.message : "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }
}

export async function deletePrivateSiteAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("siteId"));
  if (!id) return;
  const site = await getPrivateSiteById(id);
  await deletePrivateSite(id);
  // The uploaded photos belong to this site only — don't leave them orphaned.
  for (const url of Object.values(site?.images ?? {})) await deleteBlobQuietly(url);
  revalidatePath("/dashboard");
}

export type SiteImageResult = { ok: boolean; message: string; url?: string };

/** Uploads (or replaces) the photo for one image slot of a template-built
 *  private site. The browser already shrank the photo; this validates it,
 *  stores it and records it on the site — /preview/<token> picks it up on the
 *  next load, so nothing is re-rendered. */
export async function uploadPrivateSiteImageAction(formData: FormData): Promise<SiteImageResult> {
  await requireAdmin();
  const id = Number(formData.get("siteId"));
  const key = (formData.get("key") ?? "").toString();
  const file = formData.get("image");

  const site = id ? await getPrivateSiteById(id) : null;
  if (!site) return { ok: false, message: "سایت پیدا نشد." };
  if (!imageSlotsFor(templateIdOfSite(site)).some((s) => s.key === key)) {
    return { ok: false, message: "این جای عکس برای این سایت تعریف نشده." };
  }
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "عکسی انتخاب نشده." };

  try {
    const url = await savePrivateSiteImage(file);
    const previous = site.images?.[key];
    await setPrivateSiteImage(id, key, url);
    if (previous) await deleteBlobQuietly(previous);
    revalidatePath("/dashboard");
    return { ok: true, message: "عکس ذخیره شد.", url };
  } catch (err) {
    console.error("uploadPrivateSiteImageAction failed:", err);
    return { ok: false, message: err instanceof Error ? err.message : "آپلود ناموفق بود، دوباره امتحان کن." };
  }
}

/** Takes a slot's photo away again (the template's placeholder returns). */
export async function removePrivateSiteImageAction(formData: FormData): Promise<SiteImageResult> {
  await requireAdmin();
  const id = Number(formData.get("siteId"));
  const key = (formData.get("key") ?? "").toString();
  const site = id ? await getPrivateSiteById(id) : null;
  if (!site) return { ok: false, message: "سایت پیدا نشد." };
  const previous = site.images?.[key];
  if (!previous) return { ok: true, message: "عکسی برای حذف نبود." };
  try {
    await setPrivateSiteImage(id, key, null);
    await deleteBlobQuietly(previous);
    revalidatePath("/dashboard");
    return { ok: true, message: "عکس حذف شد." };
  } catch (err) {
    console.error("removePrivateSiteImageAction failed:", err);
    return { ok: false, message: "حذف ناموفق بود، دوباره امتحان کن." };
  }
}

// --- CRM: leads/phone numbers the team has sourced ---------------------------

export type CrmFormState = { ok: boolean; message: string } | null;

/** Most numbers a single lead can hold (the primary one + extras). */
const CRM_MAX_PHONES = 5;

/** Trims, normalizes, de-duplicates (order kept) and drops blanks. */
function cleanPhones(raw: string[]): string[] {
  const out: string[] = [];
  for (const r of raw) {
    const t = r.trim();
    if (!t) continue;
    const p = isValidPhone(t) ? normalizePhone(t) : t;
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

/** Validates the optional Instagram / WhatsApp inputs shared by the add and
 *  edit forms. Returns the values to store (instagram as a bare handle). */
function parseSocials(
  instagramRaw: string,
  whatsappRaw: string
): { ok: true; instagram: string; whatsapp: string } | { ok: false; message: string } {
  let instagram = "";
  if (instagramRaw) {
    const handle = normalizeInstagram(instagramRaw);
    if (!handle) return { ok: false, message: "آیدی اینستاگرام معتبر نیست (مثلاً cafe_omid@ یا لینک پیج)." };
    instagram = handle;
  }
  let whatsapp = "";
  if (whatsappRaw) {
    if (!whatsappNumber(whatsappRaw)) return { ok: false, message: "شماره‌ی واتساپ معتبر نیست." };
    whatsapp = isValidPhone(whatsappRaw) ? normalizePhone(whatsappRaw) : whatsappRaw;
  }
  return { ok: true, instagram, whatsapp };
}

export async function createCrmLeadAction(
  _prevState: CrmFormState,
  formData: FormData
): Promise<CrmFormState> {
  const currentUser = await requireCrmAccess();

  const name = (formData.get("name") ?? "").toString().trim();
  const phoneRaw = (formData.get("phone") ?? "").toString().trim();
  const extraRaw = formData.getAll("extraPhone").map((v) => v.toString());
  const businessArea = (formData.get("businessArea") ?? "").toString().trim();
  const businessType = (formData.get("businessType") ?? "").toString().trim();
  const problemStatus = (formData.get("problemStatus") ?? "").toString().trim();
  const instagramRaw = (formData.get("instagram") ?? "").toString().trim();
  const whatsappRaw = (formData.get("whatsapp") ?? "").toString().trim();

  if (!name || !phoneRaw) {
    return { ok: false, message: "نام و شماره تماس رو پر کن." };
  }

  const all = cleanPhones([phoneRaw, ...extraRaw]);
  if (all.length > CRM_MAX_PHONES) {
    return { ok: false, message: `حداکثر ${toPersianDigits(CRM_MAX_PHONES)} شماره برای هر لید.` };
  }
  const [phone, ...extraPhones] = all;

  const socials = parseSocials(instagramRaw, whatsappRaw);
  if (!socials.ok) return { ok: false, message: socials.message };

  for (const p of all) {
    if (await getCrmLeadByPhone(p)) {
      return { ok: false, message: `شماره‌ی ${toPersianDigits(p)} تکراریه — قبلاً تو CRM ثبت شده.` };
    }
  }

  try {
    await createCrmLead({
      name,
      phone,
      extraPhones,
      instagram: socials.instagram,
      whatsapp: socials.whatsapp,
      businessArea,
      businessType,
      problemStatus,
      createdBy: currentUser.id,
    });
  } catch (err) {
    console.error("createCrmLeadAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "شماره ثبت شد." };
}

export type CrmEditFormState = { ok: boolean; message: string } | null;

/** Main-admin only: edits every field of an existing lead — name, primary
 *  and extra phones, area, type, problem status, Instagram, WhatsApp. */
export async function updateCrmLeadAction(
  _prevState: CrmEditFormState,
  formData: FormData
): Promise<CrmEditFormState> {
  await requireCrmOwner();

  const id = Number(formData.get("leadId"));
  if (!id) return { ok: false, message: "شناسه‌ی لید نامعتبره." };

  const name = (formData.get("name") ?? "").toString().trim();
  const phoneRaw = (formData.get("phone") ?? "").toString().trim();
  const businessArea = (formData.get("businessArea") ?? "").toString().trim();
  const businessType = (formData.get("businessType") ?? "").toString().trim();
  const problemStatus = (formData.get("problemStatus") ?? "").toString().trim();
  const instagramRaw = (formData.get("instagram") ?? "").toString().trim();
  const whatsappRaw = (formData.get("whatsapp") ?? "").toString().trim();

  if (!name || !phoneRaw) return { ok: false, message: "نام و شماره‌ی اصلی نباید خالی باشه." };

  const lead = await getCrmLeadById(id);
  if (!lead) return { ok: false, message: "لید پیدا نشد." };

  const socials = parseSocials(instagramRaw, whatsappRaw);
  if (!socials.ok) return { ok: false, message: socials.message };

  // Primary number first, then the extras (blank/duplicate numbers dropped).
  const extraRaw = formData.getAll("extraPhone").map((v) => v.toString());
  const all = cleanPhones([phoneRaw, ...extraRaw]);
  if (all.length > CRM_MAX_PHONES) {
    return { ok: false, message: `حداکثر ${toPersianDigits(CRM_MAX_PHONES)} شماره برای هر لید.` };
  }
  const [phone, ...extraPhones] = all;

  // None of the numbers may already belong to another lead.
  for (const p of all) {
    const owner = await getCrmLeadByPhone(p);
    if (owner && owner.id !== id) {
      return { ok: false, message: `شماره‌ی ${toPersianDigits(p)} برای یه لید دیگه ثبت شده.` };
    }
  }

  try {
    await updateCrmLead(id, {
      name,
      phone,
      businessArea,
      // Only when it really changed, so an untouched type is left alone.
      businessType: businessType !== lead.business_type ? businessType : undefined,
      problemStatus,
      instagram: socials.instagram,
      whatsapp: socials.whatsapp,
      extraPhones,
    });
  } catch (err) {
    console.error("updateCrmLeadAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "به‌روزرسانی شد." };
}

export async function toggleCrmCalledAction(formData: FormData) {
  await requireCrmAccess();
  const id = Number(formData.get("leadId"));
  const called = formData.get("called") === "1";
  if (!id) return;

  await setCrmLeadCalled(id, called);
  revalidatePath("/dashboard");
}

/** One click, no typing — the dropdown's selected option is the call's
 *  outcome and marks the lead called in the same action, so there's never
 *  a separate "mark called" step to remember.
 *
 *  - Picking the blank option reverts to "not called" (correcting a
 *    mis-click; nothing gets logged).
 *  - Otherwise it's handed to recordCrmCallResult, which only logs a new
 *    entry in the daily report if today doesn't already have one for this
 *    lead — picking a different result later the same day just corrects
 *    today's entry instead of adding a duplicate. */
export async function setCrmCallResultAction(formData: FormData) {
  const currentUser = await requireCrmAccess();
  const leadId = Number(formData.get("leadId"));
  const result = (formData.get("result") ?? "").toString();
  // The panel only sends confirm=1 after the "are you sure?" dialog for
  // "قبول برای دیدن" was approved — that is what unlocks the auto site build.
  const confirmed = formData.get("confirm") === "1";
  if (!leadId) return;

  // Read BEFORE recording, so we know whether the lead was already accepted
  // (re-submitting the same status must not build a second site).
  const before = result === CRM_ACCEPT_RESULT ? await getCrmLeadById(leadId) : undefined;

  if (!result) {
    await setCrmLeadCalled(leadId, false);
  } else {
    await recordCrmCallResult({ leadId, userId: currentUser.id, result });
  }
  revalidatePath("/dashboard");

  if (confirmed && before && !(before.called && before.last_call_result === CRM_ACCEPT_RESULT)) {
    await autoBuildSiteForLead(before, currentUser.id);
    revalidatePath("/dashboard");
  }
}

/** Admin-only — a developer with the "crm" permission can add leads and
 *  flip the "called" flag, but can't delete one. */
export async function deleteCrmLeadAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("leadId"));
  if (!id) return;

  await deleteCrmLead(id);
  revalidatePath("/dashboard");
}

// --- Channels: pages the team messages about a partnership/promotion --------

export type ChannelFormState = { ok: boolean; message: string } | null;

export async function createChannelLeadAction(
  _prevState: ChannelFormState,
  formData: FormData
): Promise<ChannelFormState> {
  const currentUser = await requireChannelsAccess();

  const pageName = (formData.get("pageName") ?? "").toString().trim();
  const businessName = (formData.get("businessName") ?? "").toString().trim();
  const note = (formData.get("note") ?? "").toString().trim();

  if (!pageName || !businessName) {
    return { ok: false, message: "اسم پیج/کانال و اسم کسب‌وکار رو پر کن." };
  }

  try {
    await createChannelLead({ pageName, businessName, note, createdBy: currentUser.id });
  } catch (err) {
    console.error("createChannelLeadAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "ثبت شد." };
}

/** Same shape as setCrmCallResultAction: the dropdown's pick both sets the
 *  outcome and marks the channel messaged in one action; blank reverts to
 *  "not messaged"; recordChannelMessageResult handles the per-day dedup. */
export async function setChannelResultAction(formData: FormData) {
  const currentUser = await requireChannelsAccess();
  const channelId = Number(formData.get("channelId"));
  const result = (formData.get("result") ?? "").toString();
  if (!channelId) return;

  if (!result) {
    await setChannelLeadMessaged(channelId, false);
  } else {
    await recordChannelMessageResult({ channelId, userId: currentUser.id, result });
  }
  revalidatePath("/dashboard");
}

/** Admin-only — a developer with the "channels" permission can add
 *  channels and flip their status, but can't delete one. */
export async function deleteChannelLeadAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("channelId"));
  if (!id) return;

  await deleteChannelLead(id);
  revalidatePath("/dashboard");
}

// --- Tasks: admin assigns to a developer, developer checks off --------------

export type TaskFormState = { ok: boolean; message: string } | null;

export async function createTaskAction(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const currentUser = await requireAdmin();

  const title = (formData.get("title") ?? "").toString().trim();
  const description = (formData.get("description") ?? "").toString().trim();
  const assignedTo = Number(formData.get("assignedTo"));

  if (!title || !assignedTo) {
    return { ok: false, message: "عنوان تسک و برنامه‌نویس رو مشخص کن." };
  }
  const assignee = await getUserById(assignedTo);
  if (!assignee || (assignee.role !== "developer" && assignee.role !== "admin")) {
    return { ok: false, message: "برنامه‌نویس انتخاب‌شده معتبر نیست." };
  }

  try {
    await createTask({ title, description, assignedTo, createdBy: currentUser.id });
  } catch (err) {
    console.error("createTaskAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "تسک ثبت شد." };
}

/** Toggles a task open/done. Admin can toggle any task; a developer can
 *  only toggle tasks assigned to themselves. */
export async function toggleTaskStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !user.isStaff) return;

  const taskId = Number(formData.get("taskId"));
  const nextStatus = (formData.get("status") ?? "open").toString() as "open" | "done";
  if (!taskId) return;

  if (user.role !== "admin") {
    const own = (await getTasksForUser(user.id)).some((t) => t.id === taskId);
    if (!own) return;
  }

  await setTaskStatus(taskId, nextStatus);
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData) {
  await requireAdmin();
  const taskId = Number(formData.get("taskId"));
  if (!taskId) return;

  await deleteTask(taskId);
  revalidatePath("/dashboard");
}

// --- Blog posts (admin, or a developer granted the "blog" permission) -------

export type BlogFormState = { ok: boolean; message: string } | null;

/** Shared by create/update: trims the fields, falls back to a slug derived
 *  from the title when the "لینک" field was left blank, validates it, and
 *  checks it isn't already taken by another post. Returns either the clean
 *  fields or an error message to show in the form. */
type BlogFieldsResult =
  | { ok: false; message: string }
  | { ok: true; title: string; excerpt: string; content: string; slug: string; published: boolean };

async function readBlogFields(formData: FormData, excludePostId?: number): Promise<BlogFieldsResult> {
  const title = (formData.get("title") ?? "").toString().trim();
  const excerpt = (formData.get("excerpt") ?? "").toString().trim();
  const content = (formData.get("content") ?? "").toString().trim();
  // "1"/"0" come from the دو دکمه‌ی «انتشار مقاله» / «ذخیره به‌عنوان
  // پیش‌نویس» (BlogPanel.tsx) — a native multi-submit-button pattern, so
  // there's no way to "forget" to check a box and accidentally save a
  // finished article as an invisible draft. "on" is kept for compatibility
  // with any older bookmarked/cached form markup still using a checkbox.
  const publishedRaw = formData.get("published");
  const published = publishedRaw === "1" || publishedRaw === "on";
  let slug = (formData.get("slug") ?? "").toString().trim();

  if (!title || !content) {
    return { ok: false, message: "عنوان و متن مقاله رو پر کن." };
  }

  slug = slugify(slug || title);
  if (!slug || !isValidSlug(slug)) {
    return { ok: false, message: "لینک مقاله معتبر نیست — فقط حروف، عدد و خط تیره مجازه." };
  }
  const existing = await getBlogPostBySlug(slug, excludePostId);
  if (existing) {
    return { ok: false, message: "این لینک قبلاً برای یه مقاله‌ی دیگه استفاده شده — یه لینک دیگه انتخاب کن." };
  }

  return { ok: true, title, excerpt, content, slug, published };
}

export async function createBlogPostAction(
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const user = await requireBlogAccess();

  const fields = await readBlogFields(formData);
  if (!fields.ok) return { ok: false, message: fields.message };

  let coverImage = "";
  const file = formData.get("coverImage");
  if (file instanceof File && file.size > 0) {
    try {
      coverImage = (await saveBlogImage(file)) || "";
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : "آپلود عکس ناموفق بود." };
    }
  }

  try {
    await createBlogPost({ ...fields, coverImage, authorId: user.id });
  } catch (err) {
    console.error("createBlogPostAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/blog");
  revalidatePath(`/blog/${fields.slug}`);
  return { ok: true, message: fields.published ? "مقاله منتشر شد." : "مقاله به‌صورت پیش‌نویس ذخیره شد." };
}

export async function updateBlogPostAction(
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  await requireBlogAccess();

  const postId = Number(formData.get("postId"));
  const existingPost = postId ? await getBlogPostById(postId) : undefined;
  if (!postId || !existingPost) {
    return { ok: false, message: "مقاله پیدا نشد." };
  }

  const fields = await readBlogFields(formData, postId);
  if (!fields.ok) return { ok: false, message: fields.message };

  let coverImage: string | undefined = undefined;
  const file = formData.get("coverImage");
  // The "حذف تصویر کاور" checkbox in BlogPanel.tsx sends this when the
  // admin wants to clear the cover without picking a replacement file.
  // A newly-picked file always wins over it (see BlogFields: the checkbox
  // is hidden the moment a new file is chosen).
  const removeCoverImage = formData.get("removeCoverImage") === "1";
  if (file instanceof File && file.size > 0) {
    try {
      coverImage = (await saveBlogImage(file)) || undefined;
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : "آپلود عکس ناموفق بود." };
    }
  } else if (removeCoverImage) {
    coverImage = "";
  }

  try {
    await updateBlogPost(postId, { ...fields, coverImage });
  } catch (err) {
    console.error("updateBlogPostAction failed:", err);
    return { ok: false, message: "یه مشکلی پیش اومد، دوباره امتحان کن." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/blog");
  revalidatePath(`/blog/${fields.slug}`);
  if (existingPost.slug !== fields.slug) revalidatePath(`/blog/${existingPost.slug}`);
  return { ok: true, message: "تغییرات ذخیره شد." };
}

export async function toggleBlogPublishedAction(formData: FormData) {
  await requireBlogAccess();
  const postId = Number(formData.get("postId"));
  const published = formData.get("published") === "1";
  if (!postId) return;

  await setBlogPostPublished(postId, published);
  revalidatePath("/dashboard");
  revalidatePath("/blog");
  const post = await getBlogPostById(postId);
  if (post) revalidatePath(`/blog/${post.slug}`);
}

/** Admin-only — a developer with the "blog" permission can write, edit,
 *  and publish/unpublish articles, but can't delete one. */
export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  const postId = Number(formData.get("postId"));
  if (!postId) return;

  const post = await getBlogPostById(postId);
  await deleteBlogPost(postId);
  revalidatePath("/dashboard");
  revalidatePath("/blog");
  if (post) revalidatePath(`/blog/${post.slug}`);
}

/** Called directly (not via a <form>) by the content editor's "افزودن
 *  تصویر" toolbar button while writing an article — uploads the picked
 *  file right away and hands back a URL to insert as `![](url)` at the
 *  cursor, so images can go anywhere inside the body, not just the cover. */
export async function uploadBlogContentImageAction(
  formData: FormData
): Promise<{ ok: boolean; url?: string; message?: string }> {
  await requireBlogAccess();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایلی انتخاب نشده." };
  }
  try {
    const url = await saveBlogImage(file);
    if (!url) return { ok: false, message: "فایلی انتخاب نشده." };
    return { ok: true, url };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "آپلود تصویر ناموفق بود." };
  }
}
