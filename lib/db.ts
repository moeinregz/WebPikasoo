import { MongoClient, Db } from "mongodb";
import type { MenuCategory } from "@/lib/siteTemplates/menu";
import { DEFAULT_WORK_HOURS, nowUtcStr, sessionMinutes, tehranDay, tehranToUtc, utcToMs } from "./attendance";
import crypto from "crypto";
import { cacheWrap, invalidateCache } from "@/lib/redis";
import { CRM_ACCEPT_RESULT, tehranDayKey, todayTehranKey } from "@/lib/crmReport";

// MongoDB Atlas storage. This is the async, serverless-friendly
// replacement for the old file-based SQLite database — it works on
// Vercel (and any other platform with an ephemeral filesystem) because
// all data lives in Atlas, not on local disk.
//
// Required environment variable:
//   MONGODB_URI  — the full Atlas connection string, e.g.
//   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/webpikaso?retryWrites=true&w=majority
//
// Set it in .env.local for local development and in your hosting
// provider's project settings (e.g. Vercel → Settings → Environment
// Variables) for production/preview deployments.
//
// The database name defaults to "webpikaso" if the connection string
// doesn't include one; override with the optional MONGODB_DB variable.

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let cachedClientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "متغیر محیطی MONGODB_URI تنظیم نشده. رشته اتصال MongoDB Atlas را در .env.local (برای اجرای محلی) یا در تنظیمات محیطی هاست (مثلاً Vercel) قرار بده."
    );
  }

  if (cachedClientPromise) return cachedClientPromise;

  const client = new MongoClient(uri);

  if (process.env.NODE_ENV === "development") {
    // Reuse the same connection across hot-reloads in dev instead of
    // opening a new one on every file save.
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = client.connect();
    }
    cachedClientPromise = global._mongoClientPromise;
  } else {
    cachedClientPromise = client.connect();
  }

  return cachedClientPromise;
}

async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "webpikaso");
}

/** Timestamp format kept identical to the old SQLite `datetime('now')`
 *  output ("YYYY-MM-DD HH:MM:SS", UTC) so every existing formatDate/
 *  formatDateTime helper in the UI keeps working unchanged. */
function nowStr(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/** Atomic auto-increment, replacing SQL's AUTOINCREMENT primary keys so
 *  every id in the app stays a plain number (no ObjectId strings to
 *  thread through forms, comparisons, and type definitions). */
async function nextId(sequenceName: string): Promise<number> {
  const database = await getDb();
  const result = await database
    .collection("counters")
    .findOneAndUpdate(
      { _id: sequenceName as unknown as any },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  const doc: any = (result as any)?.value ?? result;
  return doc.seq as number;
}

// One-time (per cold start) setup: sync legacy is_admin flags into the
// role field, mirroring the old migration that ran on every boot.
let didSyncRoles = false;
async function syncLegacyAdminRoles(): Promise<void> {
  if (didSyncRoles) return;
  didSyncRoles = true;
  const database = await getDb();
  await database
    .collection("users")
    .updateMany({ is_admin: 1, role: "customer" }, { $set: { role: "admin" } });
}

// -----------------------------------------------------------------------
// Inquiries
// -----------------------------------------------------------------------

export type Inquiry = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  budget: string | null;
  message: string;
  user_id: number | null;
  status: "new" | "followed_up";
  /** "site" (the public contact form — also what every older record is) or
   *  "manual" (an order a sales expert registered by hand after taking it
   *  outside the site). Manual orders are private to whoever registered
   *  them (see inquiriesVisibleTo). */
  source?: "site" | "manual";
  /** Staff id of whoever registered a manual order. */
  created_by?: number | null;
  // ---- details only manual orders carry ----
  business_name?: string;
  phone2?: string;
  city?: string;
  instagram?: string;
  /** How the order reached us: phone, WhatsApp, Instagram, in person… */
  channel?: string;
  agreed_price?: string;
  deposit?: string;
  payment_status?: "unpaid" | "deposit" | "paid";
  /** Free text (e.g. a Jalali date) — when it must be delivered. */
  delivery_date?: string;
  /** Internal notes, never shown to the customer. */
  notes?: string;
};

export type NewInquiry = {
  name: string;
  /** Optional — the contact form no longer requires an email address.
   *  Stored as an empty string when omitted. */
  email?: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  message: string;
  /** Set when the person submitting is logged in — links the inquiry to
   *  their account so it shows up on their /account dashboard. */
  userId?: number;
};

export async function insertInquiry(data: NewInquiry): Promise<void> {
  const database = await getDb();
  const id = await nextId("inquiries");
  await database.collection<Inquiry>("inquiries").insertOne({
    id,
    created_at: nowStr(),
    name: data.name,
    email: data.email || "",
    phone: data.phone || null,
    project_type: data.projectType || null,
    budget: data.budget || null,
    message: data.message,
    user_id: data.userId ?? null,
    status: "new",
  });
}

/** Everything a manual order records (name, phone and `message` — the order
 *  description — are required, the rest optional). */
export type ManualOrderData = {
  name: string;
  phone: string;
  message: string;
  email?: string;
  businessName?: string;
  phone2?: string;
  city?: string;
  instagram?: string;
  channel?: string;
  projectType?: string;
  agreedPrice?: string;
  deposit?: string;
  paymentStatus?: "unpaid" | "deposit" | "paid";
  deliveryDate?: string;
  notes?: string;
};

function manualFields(data: ManualOrderData) {
  return {
    name: data.name,
    email: data.email || "",
    phone: data.phone,
    project_type: data.projectType || null,
    message: data.message,
    business_name: data.businessName || "",
    phone2: data.phone2 || "",
    city: data.city || "",
    instagram: data.instagram || "",
    channel: data.channel || "",
    agreed_price: data.agreedPrice || "",
    deposit: data.deposit || "",
    payment_status: data.paymentStatus || "unpaid",
    delivery_date: data.deliveryDate || "",
    notes: data.notes || "",
  };
}

/** Registers an order taken outside the site, owned by one staff member. */
export async function insertManualOrder(data: ManualOrderData, createdBy: number): Promise<void> {
  const database = await getDb();
  const id = await nextId("inquiries");
  await database.collection<Inquiry>("inquiries").insertOne({
    id,
    created_at: nowStr(),
    budget: null,
    user_id: null,
    status: "new",
    source: "manual",
    created_by: createdBy,
    ...manualFields(data),
  } as Inquiry);
}

export async function getInquiryById(id: number): Promise<Inquiry | null> {
  const database = await getDb();
  const inq = await database.collection<Inquiry>("inquiries").findOne({ id }, { projection: { _id: 0 } });
  return inq ?? null;
}

/** Edits a manual order in place — never changes who owns it. */
export async function updateManualOrder(id: number, data: ManualOrderData): Promise<void> {
  const database = await getDb();
  await database
    .collection<Inquiry>("inquiries")
    .updateOne({ id, source: "manual" }, { $set: manualFields(data) });
}

/** Contact-form inquiries are visible to everyone with orders access (as
 *  before). A manual order is visible ONLY to the staff member who
 *  registered it — and to admins, who oversee everything. */
export function inquiriesVisibleTo(list: Inquiry[], viewer: { id: number; isAdmin: boolean }): Inquiry[] {
  if (viewer.isAdmin) return list;
  return list.filter((i) => i.source !== "manual" || i.created_by === viewer.id);
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  const database = await getDb();
  return database
    .collection<Inquiry>("inquiries")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
}

/** A logged-in user's own project requests, for their /account dashboard. */
export async function getInquiriesByUserId(userId: number): Promise<Inquiry[]> {
  const database = await getDb();
  return database
    .collection<Inquiry>("inquiries")
    .find({ user_id: userId }, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
}

export async function deleteInquiry(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("inquiries").deleteOne({ id });
}

/** Admin marks a project inquiry as followed-up (or back to new), without
 *  deleting it — for the "پیگیری شد" toggle in the orders tab. */
export async function setInquiryStatus(id: number, status: "new" | "followed_up"): Promise<void> {
  const database = await getDb();
  await database.collection("inquiries").updateOne({ id }, { $set: { status } });
}

// -----------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------

/** 'customer' — signs up from the public /account form, sees their own
 *  projects/tickets. 'developer' — a WebPIKASO programming-team member,
 *  gets into /dashboard to see project requests and the team chat.
 *  'admin' — full /dashboard access (orders, tickets, customers, team). */
export type UserRole = "customer" | "developer" | "admin";

export type User = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  password_hash: string;
  password_salt: string;
  is_admin: number;
  role: UserRole;
  permissions: string | null;
  /** Free-text job title/position an admin sets for a staff member —
   *  e.g. "کارشناس سئو" or "کارشناس فروش" — shown instead of the generic
   *  role name wherever team members are listed. null for customers and
   *  for staff nobody's bothered to label yet. */
  title: string | null;
};

export type NewUser = {
  name: string;
  phone: string;
  passwordHash: string;
  passwordSalt: string;
  title?: string;
};

/** Throws if the phone number is already registered (unique index). */
export async function createUser(data: NewUser): Promise<number> {
  const database = await getDb();
  const existing = await database.collection<User>("users").findOne({ phone: data.phone });
  if (existing) {
    throw new Error("این شماره تلفن قبلاً ثبت شده است.");
  }
  const id = await nextId("users");
  await database.collection<User>("users").insertOne({
    id,
    created_at: nowStr(),
    name: data.name,
    phone: data.phone,
    password_hash: data.passwordHash,
    password_salt: data.passwordSalt,
    is_admin: 0,
    role: "customer",
    permissions: null,
    title: data.title?.trim() || null,
  });
  return id;
}

export async function getUserByPhone(phone: string): Promise<User | undefined> {
  await syncLegacyAdminRoles();
  const database = await getDb();
  const user = await database
    .collection<User>("users")
    .findOne({ phone }, { projection: { _id: 0 } });
  return user ?? undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  await syncLegacyAdminRoles();
  const database = await getDb();
  const user = await database
    .collection<User>("users")
    .findOne({ id }, { projection: { _id: 0 } });
  return user ?? undefined;
}

export type PublicUser = {
  id: number;
  name: string;
  phone: string;
  created_at: string;
  is_admin: number;
  role: UserRole;
  permissions: string | null;
  title: string | null;
};

const PUBLIC_USER_PROJECTION = {
  _id: 0,
  id: 1,
  name: 1,
  phone: 1,
  created_at: 1,
  is_admin: 1,
  role: 1,
  permissions: 1,
  title: 1,
} as const;

/** For the admin dashboard's customer list — deliberately excludes
 *  password_hash/salt. Only 'customer' rows, so staff accounts don't show
 *  up mixed in with the people who signed up to hire WebPIKASO. */
export async function getAllUsers(): Promise<PublicUser[]> {
  const database = await getDb();
  return database
    .collection<User>("users")
    .find({ role: "customer" }, { projection: PUBLIC_USER_PROJECTION })
    .sort({ created_at: -1 })
    .toArray() as unknown as Promise<PublicUser[]>;
}

/** The internal programming team (role='developer'/'admin'), shown in its
 *  own "تیم برنامه‌نویسی" tab in /dashboard, separate from customers. */
export async function getUsersByRole(role: UserRole): Promise<PublicUser[]> {
  const database = await getDb();
  return database
    .collection<User>("users")
    .find({ role }, { projection: PUBLIC_USER_PROJECTION })
    .sort({ created_at: -1 })
    .toArray() as unknown as Promise<PublicUser[]>;
}

/** Sets a user's role ('customer' | 'developer' | 'admin') — this is what
 *  grants /dashboard access (developer + admin) or revokes it back to
 *  'customer'. No UI exposes this on purpose (access control is sensitive);
 *  run it once from a Node script/REPL for whoever should be staff, e.g.:
 *    node -e "require('./lib/db').setUserRole(1, 'admin')"
 *    node -e "require('./lib/db').setUserRole(2, 'developer')"
 */
export async function setUserRole(userId: number, role: UserRole): Promise<void> {
  const database = await getDb();
  await database
    .collection("users")
    .updateOne({ id: userId }, { $set: { role, is_admin: role === "admin" ? 1 : 0 } });
}

export type UpdateUserData = {
  name: string;
  phone: string;
  role: UserRole;
  /** Only set when the admin wants to reset the password too. */
  passwordHash?: string;
  passwordSalt?: string;
  /** Free-text job title/position — undefined leaves it unchanged, an
   *  empty string clears it. */
  title?: string;
};

/** Admin edits an existing account's name/phone/role, optionally resetting
 *  the password too. Used by the "ویرایش" action in the users/team tables. */
export async function updateUser(userId: number, data: UpdateUserData): Promise<void> {
  const database = await getDb();
  const set: Record<string, unknown> = {
    name: data.name,
    phone: data.phone,
    role: data.role,
    is_admin: data.role === "admin" ? 1 : 0,
  };
  if (data.passwordHash && data.passwordSalt) {
    set.password_hash = data.passwordHash;
    set.password_salt = data.passwordSalt;
  }
  if (data.title !== undefined) {
    set.title = data.title.trim() || null;
  }
  await database.collection("users").updateOne({ id: userId }, { $set: set });
}

/** Admin removes an account entirely (customer, developer, or admin). */
export async function deleteUser(userId: number): Promise<void> {
  const database = await getDb();
  await database.collection("users").deleteOne({ id: userId });
}

/** Per-developer access flags for the /dashboard tabs. Admins always have
 *  full access regardless of this — it only limits `role: 'developer'`
 *  accounts. Missing/unset flags default to the values below, which match
 *  the app's original built-in behavior (orders + team + chat, no tickets
 *  or customer list). Pure computation — no database access, so it stays
 *  synchronous exactly like before. */
export type UserPermissions = {
  tickets: boolean;
  users: boolean;
  team: boolean;
  chat: boolean;
  orders: boolean;
  blog: boolean;
  crm: boolean;
  projects: boolean;
  channels: boolean;
  /** Clock in/out + sending daily work reports to the admin. */
  attendance: boolean;
};

const DEFAULT_DEVELOPER_PERMISSIONS: UserPermissions = {
  tickets: false,
  users: false,
  team: true,
  chat: true,
  orders: false,
  blog: false,
  crm: false,
  projects: false,
  channels: false,
  attendance: true,
};

export function getUserPermissions(user: Pick<User, "role" | "permissions">): UserPermissions {
  if (user.role === "admin") {
    return {
      tickets: true,
      users: true,
      team: true,
      chat: true,
      orders: true,
      blog: true,
      crm: true,
      projects: true,
      channels: true,
      attendance: true,
    };
  }
  if (!user.permissions) return { ...DEFAULT_DEVELOPER_PERMISSIONS };
  try {
    const parsed = JSON.parse(user.permissions);
    return { ...DEFAULT_DEVELOPER_PERMISSIONS, ...parsed };
  } catch {
    return { ...DEFAULT_DEVELOPER_PERMISSIONS };
  }
}

export async function setUserPermissions(userId: number, permissions: UserPermissions): Promise<void> {
  const database = await getDb();
  await database
    .collection("users")
    .updateOne({ id: userId }, { $set: { permissions: JSON.stringify(permissions) } });
}

// -----------------------------------------------------------------------
// Support tickets
// -----------------------------------------------------------------------

export type Ticket = {
  id: number;
  user_id: number;
  created_at: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  replied_at: string | null;
};

export type NewTicket = { userId: number; subject: string; message: string };

export async function createTicket(data: NewTicket): Promise<number> {
  const database = await getDb();
  const id = await nextId("tickets");
  await database.collection<Ticket>("tickets").insertOne({
    id,
    user_id: data.userId,
    created_at: nowStr(),
    subject: data.subject,
    message: data.message,
    status: "open",
    reply: null,
    replied_at: null,
  });
  return id;
}

/** A logged-in user's own tickets, for their /account dashboard. */
export async function getTicketsByUserId(userId: number): Promise<Ticket[]> {
  const database = await getDb();
  return database
    .collection<Ticket>("tickets")
    .find({ user_id: userId }, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
}

export async function getTicketById(ticketId: number): Promise<Ticket | undefined> {
  const database = await getDb();
  const ticket = await database
    .collection<Ticket>("tickets")
    .findOne({ id: ticketId }, { projection: { _id: 0 } });
  return ticket ?? undefined;
}

export type TicketMessage = {
  id: number;
  ticket_id: number;
  created_at: string;
  sender_id: number | null;
  sender_name: string;
  sender_role: "customer" | "developer" | "admin";
  message: string;
};

export type NewTicketMessage = {
  ticketId: number;
  senderId: number | null;
  senderName: string;
  senderRole: "customer" | "developer" | "admin";
  message: string;
};

/** Adds one message to a ticket's thread — every message (from the
 *  customer or from staff) is its own document, so nothing overwrites a
 *  previous reply. */
export async function addTicketMessage(data: NewTicketMessage): Promise<void> {
  const database = await getDb();
  const id = await nextId("ticket_messages");
  await database.collection<TicketMessage>("ticket_messages").insertOne({
    id,
    ticket_id: data.ticketId,
    created_at: nowStr(),
    sender_id: data.senderId,
    sender_name: data.senderName,
    sender_role: data.senderRole,
    message: data.message,
  });
}

/** Full thread for one ticket, oldest first. Falls back to the legacy
 *  single `reply` column (from before ticket_messages existed) if the
 *  thread has nothing yet, so old tickets don't lose their answer. */
export async function getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
  const database = await getDb();
  const rows = await database
    .collection<TicketMessage>("ticket_messages")
    .find({ ticket_id: ticketId }, { projection: { _id: 0 } })
    .sort({ created_at: 1, id: 1 })
    .toArray();
  if (rows.length > 0) return rows;

  const legacy = await database
    .collection<Ticket>("tickets")
    .findOne({ id: ticketId }, { projection: { _id: 0, reply: 1, replied_at: 1 } });
  if (legacy?.reply) {
    return [
      {
        id: -1,
        ticket_id: ticketId,
        created_at: legacy.replied_at || "",
        sender_id: null,
        sender_name: "تیم پشتیبانی",
        sender_role: "admin",
        message: legacy.reply,
      },
    ];
  }
  return [];
}

export async function closeTicket(ticketId: number): Promise<void> {
  const database = await getDb();
  await database.collection("tickets").updateOne({ id: ticketId }, { $set: { status: "closed" } });
}

/** Puts a closed ticket back in the admin's open queue, in case it was
 *  closed by mistake or needs more follow-up. Doesn't clear a prior reply. */
export async function reopenTicket(ticketId: number): Promise<void> {
  const database = await getDb();
  await database.collection("tickets").updateOne({ id: ticketId }, { $set: { status: "open" } });
}

/** Admin-only: removes a ticket entirely, along with its full message
 *  thread (so nothing orphaned is left behind in ticket_messages). */
export async function deleteTicket(ticketId: number): Promise<void> {
  const database = await getDb();
  await database.collection("ticket_messages").deleteMany({ ticket_id: ticketId });
  await database.collection("tickets").deleteOne({ id: ticketId });
}

export type TicketWithUser = Ticket & { user_name: string; user_phone: string };

/** All tickets with the submitter's name/phone joined in — for the admin dashboard. */
export async function getAllTickets(): Promise<TicketWithUser[]> {
  const database = await getDb();
  const tickets = await database
    .collection<Ticket>("tickets")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
  const userIds = Array.from(new Set(tickets.map((t) => t.user_id)));
  const users = await database
    .collection<User>("users")
    .find({ id: { $in: userIds } }, { projection: { _id: 0, id: 1, name: 1, phone: 1 } })
    .toArray();
  const userMap = new Map(users.map((u) => [u.id, u]));
  return tickets.map((t) => ({
    ...t,
    user_name: userMap.get(t.user_id)?.name ?? "",
    user_phone: userMap.get(t.user_id)?.phone ?? "",
  }));
}

// -----------------------------------------------------------------------
// Team chat (staff-only: admin + developer roles)
// -----------------------------------------------------------------------
// A single shared room, not DMs — the whole WebPIKASO team talks in one
// place. Kept intentionally simple (no read receipts, no threads); the
// client polls getTeamMessagesAction every few seconds for new ones.

export type TeamMessage = {
  id: number;
  user_id: number;
  created_at: string;
  message: string;
  user_name: string;
  user_role: UserRole;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
};

export type NewTeamMessage = {
  userId: number;
  message: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
};

type TeamMessageDoc = {
  id: number;
  user_id: number;
  created_at: string;
  message: string;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
};

/** `message` accepts a plain string (back-compat) or the full object form
 *  with an optional file/voice attachment already saved to disk. */
export async function sendTeamMessage(userId: number, message: string): Promise<void>;
export async function sendTeamMessage(data: NewTeamMessage): Promise<void>;
export async function sendTeamMessage(a: number | NewTeamMessage, b?: string): Promise<void> {
  const database = await getDb();
  const id = await nextId("team_messages");
  if (typeof a === "number") {
    await database.collection<TeamMessageDoc>("team_messages").insertOne({
      id,
      user_id: a,
      created_at: nowStr(),
      message: b ?? "",
      attachment_url: null,
      attachment_type: null,
      attachment_name: null,
    });
    return;
  }
  await database.collection<TeamMessageDoc>("team_messages").insertOne({
    id,
    user_id: a.userId,
    created_at: nowStr(),
    message: a.message,
    attachment_url: a.attachmentUrl ?? null,
    attachment_type: a.attachmentType ?? null,
    attachment_name: a.attachmentName ?? null,
  });
}

/** Bare-bones lookup used only to check ownership before a delete — no
 *  joined user info needed for that. */
export async function getTeamMessageOwner(id: number): Promise<{ id: number; user_id: number } | undefined> {
  const database = await getDb();
  const row = await database
    .collection<TeamMessageDoc>("team_messages")
    .findOne({ id }, { projection: { _id: 0, id: 1, user_id: 1 } });
  return row ?? undefined;
}

/** Permanently removes a single team-chat message. Callers must check
 *  permission (admin, or the message's own author) before calling this —
 *  it does no authorization itself. */
export async function deleteTeamMessage(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("team_messages").deleteOne({ id });
}

/** Most recent team-chat messages, oldest first (ready to render top-to-bottom). */
export async function getTeamMessages(limit = 200): Promise<TeamMessage[]> {
  const database = await getDb();
  const rows = await database
    .collection<TeamMessageDoc>("team_messages")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .limit(limit)
    .toArray();
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const users = await database
    .collection<User>("users")
    .find({ id: { $in: userIds } }, { projection: { _id: 0, id: 1, name: 1, role: 1 } })
    .toArray();
  const userMap = new Map(users.map((u) => [u.id, u]));
  return rows
    .map((r) => ({
      ...r,
      user_name: userMap.get(r.user_id)?.name ?? "",
      user_role: (userMap.get(r.user_id)?.role ?? "developer") as UserRole,
    }))
    .reverse();
}

// -----------------------------------------------------------------------
// Portfolio projects (admin-manageable)
// -----------------------------------------------------------------------

export type ProjectLinkType = "url" | "html";

export type Project = {
  id: number;
  created_at: string;
  name: string;
  category: string;
  description: string;
  url: string;
  image: string;
  // "url" (default, legacy rows too): `url` is an external link, opens on
  // its own domain. "html": `url` points at an uploaded .html file in Blob
  // storage — /portfolio/view/[id] fetches and serves it on our own
  // domain instead of sending the visitor to the storage host directly.
  linkType: ProjectLinkType;
};

export type NewProject = {
  name: string;
  category: string;
  description?: string;
  url: string;
  image?: string;
  linkType?: ProjectLinkType;
};

export async function createProject(data: NewProject): Promise<number> {
  const database = await getDb();
  const id = await nextId("projects");
  await database.collection<Project>("projects").insertOne({
    id,
    created_at: nowStr(),
    name: data.name,
    category: data.category,
    description: data.description || "",
    url: data.url,
    image: data.image || "",
    linkType: data.linkType || "url",
  });
  await invalidateCache("projects:all");
  return id;
}

/** Single project lookup, used by /portfolio/view/[id] to decide whether
 *  to stream back the uploaded HTML file or redirect to an external URL. */
export async function getProjectById(id: number): Promise<Project | null> {
  const database = await getDb();
  const project = await database
    .collection<Project>("projects")
    .findOne({ id }, { projection: { _id: 0 } });
  return project ?? null;
}

export { projectViewUrl } from "@/lib/projectLink";

// One-time (per cold start) fix for rows seeded before the site's local
// screenshots/hero images were converted to WebP (see seedProjectsIfEmpty
// below — it only runs once, while the collection is empty, so any
// database that was already seeded keeps the old .jpg/.png paths forever
// unless something rewrites them). Only touches images that point at our
// own /screenshots/ or /work/ folders — those paths are exclusively set
// by our seed data, never by an admin pasting an external image URL — so
// it's safe to blanket-rewrite their extension.
let didFixLegacyProjectImages = false;
async function fixLegacyProjectImageExtensions(): Promise<void> {
  if (didFixLegacyProjectImages) return;
  didFixLegacyProjectImages = true;
  const database = await getDb();
  const stale = await database
    .collection<Project>("projects")
    .find(
      { image: { $regex: /^\/(screenshots|work)\/[^/]+\.(jpe?g|png)$/i } },
      { projection: { _id: 0, id: 1, image: 1 } }
    )
    .toArray();
  if (stale.length === 0) return;
  for (const p of stale) {
    const webpImage = p.image.replace(/\.(jpe?g|png)$/i, ".webp");
    await database.collection("projects").updateOne({ id: p.id }, { $set: { image: webpImage } });
  }
  await invalidateCache("projects:all");
}

/** Public portfolio grid, read by app/portfolio/page.tsx and rendered
 *  through BusinessShowcase. Seeded once from lib/businessSites.ts (see
 *  seedProjectsIfEmpty below) and then admin-owned from /dashboard.
 *  Cached briefly since this is read on every portfolio/dashboard load
 *  and rarely changes. */
export async function getAllProjects(): Promise<Project[]> {
  await fixLegacyProjectImageExtensions();
  return cacheWrap("projects:all", 60, async () => {
    const database = await getDb();
    return database
      .collection<Project>("projects")
      .find({}, { projection: { _id: 0 } })
      .sort({ created_at: -1, id: -1 })
      .toArray();
  });
}

export async function deleteProject(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("projects").deleteOne({ id });
  await invalidateCache("projects:all");
}

/** One-time seed from the old hardcoded lib/businessSites.ts array, so
 *  sites that were already showcased don't disappear when this collection
 *  is introduced. Only runs while the collection is empty — after that,
 *  the admin fully owns this list (add/delete from /dashboard). */
export async function seedProjectsIfEmpty(seed: NewProject[]): Promise<void> {
  const database = await getDb();
  const count = await database.collection("projects").countDocuments();
  if (count > 0) return;
  for (const item of seed) {
    await createProject(item);
  }
}

// -----------------------------------------------------------------------
// Private site previews (admin-only)
// -----------------------------------------------------------------------
// HTML sites the admin uploads just to send someone a link ("look at the
// demo I built for you"). Deliberately a separate collection from
// `projects`, so these never show up in the homepage/portfolio showcase or
// in the نمونه‌کارها tab. Each one gets a random unguessable token used in
// the public URL (/preview/[token]) instead of a sequential id, so nobody
// can walk through other people's previews by counting up.

export type PrivateSite = {
  id: number;
  created_at: string;
  token: string;
  name: string;
  note: string;
  // Vercel Blob URL of the uploaded .html file.
  url: string;
  // Set for sites built from a template (lets the dashboard know which photo
  // spots the site has, see ImageSlot in lib/siteTemplates/generate.ts).
  template_id?: string;
  // Photos uploaded for those spots: slot key → Vercel Blob URL. They are
  // swapped into the page when /preview/<token> is served.
  images?: Record<string, string>;
  // The site's own (edited) menu — only for templates with an editable menu.
  // Absent = the template's default menu. Swapped in at serve time too.
  menu?: MenuCategory[];
};

export async function createPrivateSite(data: {
  name: string;
  note?: string;
  url: string;
  template_id?: string;
}): Promise<PrivateSite> {
  const database = await getDb();
  const id = await nextId("private_sites");
  const doc: PrivateSite = {
    id,
    created_at: nowStr(),
    token: crypto.randomBytes(9).toString("base64url"),
    name: data.name,
    note: data.note || "",
    url: data.url,
    ...(data.template_id ? { template_id: data.template_id } : {}),
  };
  await database.collection<PrivateSite>("private_sites").insertOne({ ...doc });
  return doc;
}

export async function getAllPrivateSites(): Promise<PrivateSite[]> {
  const database = await getDb();
  return database
    .collection<PrivateSite>("private_sites")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
}

export async function getPrivateSiteByToken(token: string): Promise<PrivateSite | null> {
  const database = await getDb();
  const site = await database
    .collection<PrivateSite>("private_sites")
    .findOne({ token }, { projection: { _id: 0 } });
  return site ?? null;
}

export async function getPrivateSiteById(id: number): Promise<PrivateSite | null> {
  const database = await getDb();
  const site = await database
    .collection<PrivateSite>("private_sites")
    .findOne({ id }, { projection: { _id: 0 } });
  return site ?? null;
}

/** Saves the site's edited menu, or (null) goes back to the template default. */
export async function setPrivateSiteMenu(id: number, menu: MenuCategory[] | null): Promise<void> {
  const database = await getDb();
  await database
    .collection("private_sites")
    .updateOne({ id }, menu ? { $set: { menu } } : { $unset: { menu: "" } });
}

/** Sets (url) or clears (null) the photo for one slot of a private site. */
export async function setPrivateSiteImage(id: number, key: string, url: string | null): Promise<void> {
  if (!/^[a-z][a-z0-9_]*$/.test(key)) throw new Error("bad image key");
  const database = await getDb();
  await database
    .collection("private_sites")
    .updateOne({ id }, url ? { $set: { [`images.${key}`]: url } } : { $unset: { [`images.${key}`]: "" } });
}

export async function deletePrivateSite(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("private_sites").deleteOne({ id });
}

// -----------------------------------------------------------------------
// CRM leads
// -----------------------------------------------------------------------
// Phone numbers the team has sourced/found, with a simple "called yet?"
// flag the admin can flip from the CRM tab.

export type CrmLead = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  // Free-text area/neighborhood/city the business is in — typed, not
  // chosen from a list, since locations are too varied (and too granular)
  // for a fixed set the way business_type and problem_status are.
  business_area: string;
  // Which BusinessCategory (see lib/businessSites.ts) the lead's business
  // falls under, and what's wrong with their current site (see
  // CRM_PROBLEM_STATUS_OPTIONS in lib/crmReport.ts) — both chosen from a
  // fixed list, not free text, so they're filterable. Replaces the old
  // free-text "note" field. Optional/"" for leads added before this field
  // existed, or left unset.
  business_type: string;
  problem_status: string;
  called: number;
  created_by: number | null;
  // Result text from the most recent call — denormalized onto the lead so
  // the main CRM list can show it without a join. The full history of
  // every call (for the daily activity report) lives in crm_calls below.
  last_call_result?: string;
  // Optional contact extras. `phone` stays the primary number (and what the
  // duplicate check / tel: links key on); anyone with more numbers keeps the
  // rest in extra_phones. Instagram is stored as a bare handle (no "@").
  extra_phones?: string[];
  instagram?: string;
  whatsapp?: string;
  // Token of the private site auto-generated when this lead was accepted
  // ("قبول برای دیدن"), so the same lead never gets a second site.
  site_token?: string;
  // Set when the one-time category migration changed business_type: the value
  // it had before, so the migration can be undone.
  legacy_business_type?: string;
  /** Free-text internal note about this lead. Purely for the team — it is
   *  never read by the site builder / template generator. */
  note?: string;
  /** When the lead last became «قبول برای دیدن» (the demo link was sent). */
  accepted_at?: string;
  /** The follow-up after sending the demo has been done (ticked). */
  followup_done?: boolean;
  followup_done_at?: string;
  followup_by?: number | null;
};

export type NewCrmLead = {
  name: string;
  phone: string;
  extraPhones?: string[];
  instagram?: string;
  whatsapp?: string;
  businessArea?: string;
  businessType?: string;
  problemStatus?: string;
  createdBy?: number;
};

export async function createCrmLead(data: NewCrmLead): Promise<number> {
  const database = await getDb();
  const id = await nextId("crm_leads");
  await database.collection<CrmLead>("crm_leads").insertOne({
    id,
    created_at: nowStr(),
    name: data.name,
    phone: data.phone,
    business_area: data.businessArea || "",
    business_type: data.businessType || "",
    problem_status: data.problemStatus || "",
    called: 0,
    created_by: data.createdBy ?? null,
    ...(data.extraPhones && data.extraPhones.length ? { extra_phones: data.extraPhones } : {}),
    ...(data.instagram ? { instagram: data.instagram } : {}),
    ...(data.whatsapp ? { whatsapp: data.whatsapp } : {}),
  });
  return id;
}

/** Looks up an existing lead by phone — used to reject duplicates before
 *  insert. Expects the same normalized/trimmed form the caller is about to
 *  store, so it catches the common case (same number typed twice) without
 *  trying to fuzzy-match every possible formatting variant. Matches a
 *  lead's primary number or any of its extra numbers. */
export async function getCrmLeadByPhone(phone: string): Promise<CrmLead | undefined> {
  const database = await getDb();
  const lead = await database
    .collection<CrmLead>("crm_leads")
    .findOne({ $or: [{ phone }, { extra_phones: phone }] }, { projection: { _id: 0 } });
  return lead ?? undefined;
}

export async function getCrmLeadById(id: number): Promise<CrmLead | undefined> {
  const database = await getDb();
  const lead = await database.collection<CrmLead>("crm_leads").findOne({ id }, { projection: { _id: 0 } });
  return lead ?? undefined;
}

export async function setCrmLeadSite(id: number, siteToken: string): Promise<void> {
  const database = await getDb();
  await database.collection("crm_leads").updateOne({ id }, { $set: { site_token: siteToken } });
}

export async function getAllCrmLeads(): Promise<CrmLead[]> {
  const database = await getDb();
  return database
    .collection<CrmLead>("crm_leads")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
}

export async function setCrmLeadCalled(id: number, called: boolean): Promise<void> {
  const database = await getDb();
  await database.collection("crm_leads").updateOne({ id }, { $set: { called: called ? 1 : 0 } });
}

/** Lets the classification fields (added after leads already existed) and
 *  the optional contact extras (extra numbers, Instagram, WhatsApp) be
 *  filled in / corrected on an existing lead (including name and the primary
 *  phone). Never touches called/results, and only the fields actually provided — so a partial edit
 *  can't blank out a field the caller didn't mean to touch. An empty
 *  instagram/whatsapp/extraPhones clears that field. */
export async function updateCrmLead(
  id: number,
  data: {
    name?: string;
    phone?: string;
    businessArea?: string;
    businessType?: string;
    problemStatus?: string;
    instagram?: string;
    whatsapp?: string;
    extraPhones?: string[];
  }
): Promise<void> {
  const database = await getDb();
  const set: Record<string, string | string[]> = {};
  const unset: Record<string, ""> = {};
  if (data.name !== undefined) set.name = data.name;
  if (data.phone !== undefined) set.phone = data.phone;
  if (data.businessArea !== undefined) set.business_area = data.businessArea;
  if (data.businessType !== undefined) {
    set.business_type = data.businessType;
    // A hand-picked type is final: the migration's undo must never revert it.
    unset.legacy_business_type = "";
  }
  if (data.problemStatus !== undefined) set.problem_status = data.problemStatus;
  if (data.instagram !== undefined) {
    if (data.instagram) set.instagram = data.instagram;
    else unset.instagram = "";
  }
  if (data.whatsapp !== undefined) {
    if (data.whatsapp) set.whatsapp = data.whatsapp;
    else unset.whatsapp = "";
  }
  if (data.extraPhones !== undefined) {
    if (data.extraPhones.length) set.extra_phones = data.extraPhones;
    else unset.extra_phones = "";
  }
  const update: Record<string, unknown> = {};
  if (Object.keys(set).length) update.$set = set;
  if (Object.keys(unset).length) update.$unset = unset;
  if (Object.keys(update).length === 0) return;
  await database.collection("crm_leads").updateOne({ id }, update);
}

export type CrmCallLog = {
  id: number;
  lead_id: number;
  user_id: number;
  result: string;
  created_at: string;
};

/** Records a call outcome for the daily activity report — but only ever
 *  keeps ONE entry per lead per Tehran calendar day. If the lead's most
 *  recent call already happened today, this just edits that entry's
 *  result (and who touched it), since picking a different outcome later
 *  the same day is a correction, not a second call. Only when today has no
 *  entry yet (first call of the day, or the lead's last call was on an
 *  earlier day) does it insert a new log row — that's what makes it show
 *  up under *today* in the report instead of silently rewriting an older
 *  day's entry. */
export async function recordCrmCallResult(data: { leadId: number; userId: number; result: string }): Promise<void> {
  const database = await getDb();
  const lead = await database.collection<CrmLead>("crm_leads").findOne({ id: data.leadId }, { projection: { last_call_result: 1, called: 1 } });
  const newlyAccepted = data.result === CRM_ACCEPT_RESULT && !(lead?.called && lead?.last_call_result === CRM_ACCEPT_RESULT);
  const latest = await database
    .collection<CrmCallLog>("crm_calls")
    .find({ lead_id: data.leadId })
    .sort({ created_at: -1, id: -1 })
    .limit(1)
    .toArray();

  const today = todayTehranKey();
  if (latest[0] && tehranDayKey(latest[0].created_at) === today) {
    await database
      .collection("crm_calls")
      .updateOne({ id: latest[0].id }, { $set: { result: data.result, user_id: data.userId } });
  } else {
    const id = await nextId("crm_calls");
    await database.collection<CrmCallLog>("crm_calls").insertOne({
      id,
      lead_id: data.leadId,
      user_id: data.userId,
      result: data.result,
      created_at: nowStr(),
    });
  }
  await database
    .collection("crm_leads")
    .updateOne({ id: data.leadId }, { $set: { called: 1, last_call_result: data.result } });
  // A fresh «قبول برای دیدن»: remember when, and start a new (unticked) follow-up.
  if (newlyAccepted) {
    await database.collection("crm_leads").updateOne(
      { id: data.leadId },
      { $set: { accepted_at: nowStr(), followup_done: false }, $unset: { followup_done_at: "", followup_by: "" } }
    );
  }
}

/** Ticks / unticks the follow-up of an accepted lead. */
export async function setCrmLeadFollowup(id: number, done: boolean, userId: number): Promise<void> {
  const database = await getDb();
  await database.collection("crm_leads").updateOne(
    { id },
    done
      ? { $set: { followup_done: true, followup_done_at: nowStr(), followup_by: userId } }
      : { $set: { followup_done: false }, $unset: { followup_done_at: "", followup_by: "" } }
  );
}

/** Saves (or clears, when empty) the lead's note. Kept apart from
 *  updateCrmLead on purpose: notes are independent of the site builder. */
export async function setCrmLeadNote(id: number, note: string): Promise<void> {
  const database = await getDb();
  await database.collection("crm_leads").updateOne({ id }, note ? { $set: { note } } : { $unset: { note: "" } });
}

export async function getAllCrmCallLogs(): Promise<CrmCallLog[]> {
  const database = await getDb();
  return database
    .collection<CrmCallLog>("crm_calls")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
}

export async function deleteCrmLead(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("crm_leads").deleteOne({ id });
}

// -----------------------------------------------------------------------
// Channel messages
// -----------------------------------------------------------------------
// Same shape/behavior as CRM leads above (see comments there for the
// reasoning — day-deduped log, denormalized "latest result" on the row
// itself), but for pages/channels the team messages instead of numbers
// they call. Kept as its own pair of collections rather than reusing the
// CRM ones since the fields differ (page/business name, not phone) and
// the two pipelines are conceptually separate.

export type ChannelLead = {
  id: number;
  created_at: string;
  page_name: string;
  business_name: string;
  note: string;
  messaged: number;
  created_by: number | null;
  // Result text from the most recent message — denormalized here the same
  // way CrmLead.last_call_result is, so the list can show it without a
  // join. Full history lives in channel_messages below.
  last_message_result?: string;
};

export type NewChannelLead = { pageName: string; businessName: string; note?: string; createdBy?: number };

export async function createChannelLead(data: NewChannelLead): Promise<number> {
  const database = await getDb();
  const id = await nextId("channel_leads");
  await database.collection<ChannelLead>("channel_leads").insertOne({
    id,
    created_at: nowStr(),
    page_name: data.pageName,
    business_name: data.businessName,
    note: data.note || "",
    messaged: 0,
    created_by: data.createdBy ?? null,
  });
  return id;
}

export async function getAllChannelLeads(): Promise<ChannelLead[]> {
  const database = await getDb();
  return database
    .collection<ChannelLead>("channel_leads")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
}

export async function setChannelLeadMessaged(id: number, messaged: boolean): Promise<void> {
  const database = await getDb();
  await database.collection("channel_leads").updateOne({ id }, { $set: { messaged: messaged ? 1 : 0 } });
}

export type ChannelMessageLog = {
  id: number;
  channel_id: number;
  user_id: number;
  result: string;
  created_at: string;
};

/** Same day-dedup rule as recordCrmCallResult: at most one log row per
 *  channel per Tehran calendar day. Picking a different result later the
 *  same day corrects that day's row instead of adding a duplicate; a
 *  result picked on a new day (or the first ever for this channel) logs a
 *  fresh row, which is what makes it show up under *that* day in the
 *  report. */
export async function recordChannelMessageResult(data: {
  channelId: number;
  userId: number;
  result: string;
}): Promise<void> {
  const database = await getDb();
  const latest = await database
    .collection<ChannelMessageLog>("channel_messages")
    .find({ channel_id: data.channelId })
    .sort({ created_at: -1, id: -1 })
    .limit(1)
    .toArray();

  const today = todayTehranKey();
  if (latest[0] && tehranDayKey(latest[0].created_at) === today) {
    await database
      .collection("channel_messages")
      .updateOne({ id: latest[0].id }, { $set: { result: data.result, user_id: data.userId } });
  } else {
    const id = await nextId("channel_messages");
    await database.collection<ChannelMessageLog>("channel_messages").insertOne({
      id,
      channel_id: data.channelId,
      user_id: data.userId,
      result: data.result,
      created_at: nowStr(),
    });
  }
  await database
    .collection("channel_leads")
    .updateOne({ id: data.channelId }, { $set: { messaged: 1, last_message_result: data.result } });
}

export async function getAllChannelMessageLogs(): Promise<ChannelMessageLog[]> {
  const database = await getDb();
  return database
    .collection<ChannelMessageLog>("channel_messages")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
}

export async function deleteChannelLead(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("channel_leads").deleteOne({ id });
}

// -----------------------------------------------------------------------
// Tasks (admin assigns to a developer, developer checks off)
// -----------------------------------------------------------------------

export type Task = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  assigned_to: number;
  created_by: number | null;
  status: "open" | "done";
  done_at: string | null;
};

export type TaskWithAssignee = Task & { assignee_name: string };

export type NewTask = { title: string; description?: string; assignedTo: number; createdBy?: number };

export async function createTask(data: NewTask): Promise<number> {
  const database = await getDb();
  const id = await nextId("tasks");
  await database.collection<Task>("tasks").insertOne({
    id,
    created_at: nowStr(),
    title: data.title,
    description: data.description || "",
    assigned_to: data.assignedTo,
    created_by: data.createdBy ?? null,
    status: "open",
    done_at: null,
  });
  return id;
}

/** All tasks with the assignee's name joined in — for the admin's tasks tab. */
export async function getAllTasks(): Promise<TaskWithAssignee[]> {
  const database = await getDb();
  const tasks = await database
    .collection<Task>("tasks")
    .find({}, { projection: { _id: 0 } })
    .sort({ status: 1, created_at: -1 })
    .toArray();
  const userIds = Array.from(new Set(tasks.map((t) => t.assigned_to)));
  const users = await database
    .collection<User>("users")
    .find({ id: { $in: userIds } }, { projection: { _id: 0, id: 1, name: 1 } })
    .toArray();
  const userMap = new Map(users.map((u) => [u.id, u.name]));
  return tasks.map((t) => ({ ...t, assignee_name: userMap.get(t.assigned_to) ?? "" }));
}

/** A developer's own assigned tasks, for their "تسک‌های من" tab. */
export async function getTasksForUser(userId: number): Promise<Task[]> {
  const database = await getDb();
  return database
    .collection<Task>("tasks")
    .find({ assigned_to: userId }, { projection: { _id: 0 } })
    .sort({ status: 1, created_at: -1 })
    .toArray();
}

export async function setTaskStatus(id: number, status: "open" | "done"): Promise<void> {
  const database = await getDb();
  await database.collection("tasks").updateOne(
    { id },
    { $set: { status, done_at: status === "done" ? nowStr() : null } }
  );
}

export async function deleteTask(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("tasks").deleteOne({ id });
}

// -----------------------------------------------------------------------
// Blog posts
// -----------------------------------------------------------------------
// Admin (or a developer granted the "blog" permission) writes posts from
// /dashboard; the public site reads only published ones at /blog.

export type BlogPost = {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published: number;
  author_id: number | null;
};

export type BlogPostWithAuthor = BlogPost & { author_name: string | null };

export type NewBlogPost = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  published?: boolean;
  authorId?: number;
};

export type UpdateBlogPostData = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  /** Omit to leave the current cover image untouched (e.g. no new file
   *  was uploaded on this edit). */
  coverImage?: string;
  published: boolean;
};

export async function createBlogPost(data: NewBlogPost): Promise<number> {
  const database = await getDb();
  const id = await nextId("blog_posts");
  const now = nowStr();
  await database.collection<BlogPost>("blog_posts").insertOne({
    id,
    created_at: now,
    updated_at: now,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || "",
    content: data.content,
    cover_image: data.coverImage || "",
    published: data.published ? 1 : 0,
    author_id: data.authorId ?? null,
  });
  await invalidateCache("blog:published", `blog:slug:${data.slug}`);
  return id;
}

export async function updateBlogPost(id: number, data: UpdateBlogPostData): Promise<void> {
  const database = await getDb();
  const existing = await database
    .collection<BlogPost>("blog_posts")
    .findOne({ id }, { projection: { _id: 0, slug: 1 } });
  const set: Record<string, unknown> = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || "",
    content: data.content,
    published: data.published ? 1 : 0,
    updated_at: nowStr(),
  };
  if (data.coverImage !== undefined) {
    set.cover_image = data.coverImage;
  }
  await database.collection("blog_posts").updateOne({ id }, { $set: set });
  // Invalidate both the old and new slug in case this edit renamed it.
  await invalidateCache("blog:published", `blog:slug:${data.slug}`, ...(existing ? [`blog:slug:${existing.slug}`] : []));
}

export async function setBlogPostPublished(id: number, published: boolean): Promise<void> {
  const database = await getDb();
  const existing = await database
    .collection<BlogPost>("blog_posts")
    .findOne({ id }, { projection: { _id: 0, slug: 1 } });
  await database
    .collection("blog_posts")
    .updateOne({ id }, { $set: { published: published ? 1 : 0, updated_at: nowStr() } });
  await invalidateCache("blog:published", ...(existing ? [`blog:slug:${existing.slug}`] : []));
}

export async function deleteBlogPost(id: number): Promise<void> {
  const database = await getDb();
  const existing = await database
    .collection<BlogPost>("blog_posts")
    .findOne({ id }, { projection: { _id: 0, slug: 1 } });
  await database.collection("blog_posts").deleteOne({ id });
  await invalidateCache("blog:published", ...(existing ? [`blog:slug:${existing.slug}`] : []));
}

export async function getBlogPostById(id: number): Promise<BlogPost | undefined> {
  const database = await getDb();
  const post = await database
    .collection<BlogPost>("blog_posts")
    .findOne({ id }, { projection: { _id: 0 } });
  return post ?? undefined;
}

/** Any post with this slug other than (optionally) the one being edited —
 *  used to keep slugs unique with a friendly error instead of a raw
 *  database duplicate-key crash. */
export async function getBlogPostBySlug(slug: string, excludeId?: number): Promise<BlogPost | undefined> {
  const database = await getDb();
  const filter: Record<string, unknown> = { slug };
  if (excludeId) filter.id = { $ne: excludeId };
  const post = await database
    .collection<BlogPost>("blog_posts")
    .findOne(filter, { projection: { _id: 0 } });
  return post ?? undefined;
}

async function attachAuthorNames(posts: BlogPost[]): Promise<BlogPostWithAuthor[]> {
  const database = await getDb();
  const authorIds = Array.from(new Set(posts.map((p) => p.author_id).filter((id): id is number => id != null)));
  const authors = authorIds.length
    ? await database
        .collection<User>("users")
        .find({ id: { $in: authorIds } }, { projection: { _id: 0, id: 1, name: 1 } })
        .toArray()
    : [];
  const authorMap = new Map(authors.map((a) => [a.id, a.name]));
  return posts.map((p) => ({
    ...p,
    author_name: p.author_id != null ? authorMap.get(p.author_id) ?? null : null,
  }));
}

/** All posts (draft + published) with author name joined in, for the admin
 *  dashboard's "وبلاگ" tab. */
export async function getAllBlogPosts(): Promise<BlogPostWithAuthor[]> {
  const database = await getDb();
  const posts = await database
    .collection<BlogPost>("blog_posts")
    .find({}, { projection: { _id: 0 } })
    .sort({ created_at: -1, id: -1 })
    .toArray();
  return attachAuthorNames(posts);
}

/** Published posts only, for the public /blog listing. Cached briefly —
 *  this is the single most-read query on the public site and posts don't
 *  change often enough to justify hitting Mongo on every visitor. */
export async function getPublishedBlogPosts(): Promise<BlogPostWithAuthor[]> {
  return cacheWrap("blog:published", 60, async () => {
    const database = await getDb();
    const posts = await database
      .collection<BlogPost>("blog_posts")
      .find({ published: 1 }, { projection: { _id: 0 } })
      .sort({ created_at: -1, id: -1 })
      .toArray();
    return attachAuthorNames(posts);
  });
}

/** A single published post for the public /blog/[slug] page — drafts and
 *  unpublished posts 404 there even if you know the slug. Cached briefly,
 *  same reasoning as getPublishedBlogPosts. */
export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | undefined> {
  return cacheWrap(`blog:slug:${slug}`, 60, async () => {
    const database = await getDb();
    const post = await database
      .collection<BlogPost>("blog_posts")
      .findOne({ slug, published: 1 }, { projection: { _id: 0 } });
    if (!post) return undefined;
    const [withAuthor] = await attachAuthorNames([post]);
    return withAuthor;
  });
}

// -----------------------------------------------------------------------
// Attendance (ورود و خروج) + daily work reports
// -----------------------------------------------------------------------

export type AttendanceRecord = {
  id: number;
  user_id: number;
  /** Tehran calendar day this shift belongs to, "YYYY-MM-DD". */
  day: string;
  /** UTC "YYYY-MM-DD HH:MM:SS", like every other timestamp in the app. */
  check_in: string;
  check_out: string | null;
  /** Set when a forgotten clock-out was closed automatically at end of day. */
  auto_closed?: boolean;
  /** Admin who last corrected this record by hand, if any. */
  edited_by?: number | null;
};

export type WorkHours = { start: string; end: string };

export async function getWorkHours(): Promise<WorkHours> {
  const database = await getDb();
  const doc: any = await database.collection("settings").findOne({ _id: "work_hours" as unknown as any });
  if (doc?.start && doc?.end) return { start: doc.start, end: doc.end };
  return { ...DEFAULT_WORK_HOURS };
}

export async function setWorkHours(hours: WorkHours): Promise<void> {
  const database = await getDb();
  await database
    .collection("settings")
    .updateOne({ _id: "work_hours" as unknown as any }, { $set: { start: hours.start, end: hours.end } }, { upsert: true });
}

export async function getOpenAttendance(userId: number): Promise<AttendanceRecord | null> {
  const database = await getDb();
  const rec = await database
    .collection<AttendanceRecord>("attendance")
    .find({ user_id: userId, check_out: null }, { projection: { _id: 0 } })
    .sort({ check_in: -1 })
    .limit(1)
    .toArray();
  return rec[0] ?? null;
}

/** A forgotten clock-out from an earlier day is closed at that day's official
 *  end (never later than "now"), flagged so an admin can correct it. */
async function closeStale(open: AttendanceRecord, workEnd: string): Promise<void> {
  const database = await getDb();
  const endUtc = tehranToUtc(open.day, workEnd);
  const checkOut = utcToMs(endUtc) > utcToMs(open.check_in) ? endUtc : open.check_in;
  await database
    .collection<AttendanceRecord>("attendance")
    .updateOne({ id: open.id }, { $set: { check_out: checkOut, auto_closed: true } });
}

export type ClockResult = { ok: boolean; message: string };

export async function clockIn(userId: number): Promise<ClockResult> {
  const database = await getDb();
  const today = tehranDay();
  const open = await getOpenAttendance(userId);
  if (open && open.day === today) {
    return { ok: false, message: "ورود امروز قبلاً ثبت شده و هنوز خروج نزدید." };
  }
  if (open) await closeStale(open, (await getWorkHours()).end);
  const id = await nextId("attendance");
  await database.collection<AttendanceRecord>("attendance").insertOne({
    id,
    user_id: userId,
    day: today,
    check_in: nowUtcStr(),
    check_out: null,
  });
  return { ok: true, message: "ورود ثبت شد. روز خوبی داشته باشید!" };
}

export async function clockOut(userId: number): Promise<ClockResult> {
  const database = await getDb();
  const open = await getOpenAttendance(userId);
  if (!open) return { ok: false, message: "ورود بازی ثبت نشده؛ اول «ثبت ورود» بزنید." };
  if (open.day !== tehranDay()) {
    await closeStale(open, (await getWorkHours()).end);
    return {
      ok: true,
      message: "خروج روز قبل ثبت نشده بود؛ به‌صورت خودکار تا پایان ساعت کاری بسته شد (مدیر می‌تونه اصلاحش کنه).",
    };
  }
  await database.collection<AttendanceRecord>("attendance").updateOne({ id: open.id }, { $set: { check_out: nowUtcStr() } });
  return { ok: true, message: "خروج ثبت شد. خسته نباشید!" };
}

export async function getAttendanceForUser(userId: number, fromDay: string): Promise<AttendanceRecord[]> {
  const database = await getDb();
  return database
    .collection<AttendanceRecord>("attendance")
    .find({ user_id: userId, day: { $gte: fromDay } }, { projection: { _id: 0 } })
    .sort({ check_in: -1 })
    .toArray();
}

export async function getAttendanceSince(fromDay: string): Promise<AttendanceRecord[]> {
  const database = await getDb();
  return database
    .collection<AttendanceRecord>("attendance")
    .find({ day: { $gte: fromDay } }, { projection: { _id: 0 } })
    .sort({ check_in: -1 })
    .toArray();
}

export async function getAttendanceById(id: number): Promise<AttendanceRecord | null> {
  const database = await getDb();
  return (await database.collection<AttendanceRecord>("attendance").findOne({ id }, { projection: { _id: 0 } })) ?? null;
}

/** Admin adds a missed shift by hand. */
export async function insertAttendanceManual(
  userId: number,
  day: string,
  checkIn: string,
  checkOut: string | null,
  editedBy: number
): Promise<void> {
  const database = await getDb();
  const id = await nextId("attendance");
  await database
    .collection<AttendanceRecord>("attendance")
    .insertOne({ id, user_id: userId, day, check_in: checkIn, check_out: checkOut, edited_by: editedBy });
}

/** Admin corrects a record's day / times (a blank check-out leaves it open). */
export async function updateAttendance(
  id: number,
  data: { day: string; checkIn: string; checkOut: string | null },
  editedBy: number
): Promise<void> {
  const database = await getDb();
  await database.collection<AttendanceRecord>("attendance").updateOne(
    { id },
    { $set: { day: data.day, check_in: data.checkIn, check_out: data.checkOut, edited_by: editedBy, auto_closed: false } }
  );
}

export async function deleteAttendance(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("attendance").deleteOne({ id });
}

/** Re-exported so callers don't need a second import for one tiny helper. */
export { sessionMinutes };

export type WorkReport = {
  id: number;
  user_id: number;
  /** The Tehran day the report is about, "YYYY-MM-DD". */
  day: string;
  created_at: string;
  updated_at: string;
  summary: string;
  calls: string;
  orders: string;
  revenue: string;
  issues: string;
  tomorrow: string;
  /** Counted by the server from the CRM when the report is sent, so the
   *  sender never has to count anything by hand. */
  stats?: WorkStats;
  status: "new" | "read";
  /** The admin's reply, shown to the sender. */
  feedback: string;
  feedback_at: string | null;
};

export type WorkReportData = {
  day: string;
  summary: string;
  calls: string;
  orders: string;
  revenue: string;
  issues: string;
  tomorrow: string;
};

export async function insertWorkReport(userId: number, data: WorkReportData, stats: WorkStats): Promise<void> {
  const database = await getDb();
  const id = await nextId("work_reports");
  const now = nowUtcStr();
  await database.collection<WorkReport>("work_reports").insertOne({
    id,
    user_id: userId,
    created_at: now,
    updated_at: now,
    status: "new",
    feedback: "",
    feedback_at: null,
    stats,
    ...data,
  });
}

export async function getWorkReportById(id: number): Promise<WorkReport | null> {
  const database = await getDb();
  return (await database.collection<WorkReport>("work_reports").findOne({ id }, { projection: { _id: 0 } })) ?? null;
}

/** The sender may edit a report until the admin has read it. */
export async function updateWorkReport(id: number, data: WorkReportData, stats: WorkStats): Promise<void> {
  const database = await getDb();
  await database.collection<WorkReport>("work_reports").updateOne({ id }, { $set: { ...data, stats, updated_at: nowUtcStr() } });
}

export async function deleteWorkReport(id: number): Promise<void> {
  const database = await getDb();
  await database.collection("work_reports").deleteOne({ id });
}

export async function getWorkReportsForUser(userId: number): Promise<WorkReport[]> {
  const database = await getDb();
  return database
    .collection<WorkReport>("work_reports")
    .find({ user_id: userId }, { projection: { _id: 0 } })
    .sort({ day: -1, id: -1 })
    .limit(120)
    .toArray();
}

export async function getAllWorkReports(): Promise<WorkReport[]> {
  const database = await getDb();
  return database
    .collection<WorkReport>("work_reports")
    .find({}, { projection: { _id: 0 } })
    .sort({ day: -1, id: -1 })
    .limit(400)
    .toArray();
}

export async function setWorkReportStatus(id: number, status: "new" | "read"): Promise<void> {
  const database = await getDb();
  await database.collection<WorkReport>("work_reports").updateOne({ id }, { $set: { status } });
}

/** Saving feedback also marks the report as read. */
export async function setWorkReportFeedback(id: number, feedback: string): Promise<void> {
  const database = await getDb();
  await database
    .collection<WorkReport>("work_reports")
    .updateOne({ id }, { $set: { feedback, feedback_at: feedback ? nowUtcStr() : null, status: "read" } });
}

/** What a sales expert did on one day, counted from the CRM. */
export type WorkStats = {
  /** Numbers (leads) they registered in the CRM that day. */
  leads: number;
  /** Calls they made (one per lead per day, as in the CRM report). */
  calls: number;
  /** Of those calls, how many ended as «قبول برای دیدن». */
  accepted: number;
  /** Follow-ups they ticked off. */
  followups: number;
  /** Manual orders (خارج از سایت) they registered. */
  orders: number;
  /** Calls per outcome, e.g. { "پاسخ نداد": 12, "سایت دارد": 3 }. */
  byResult: Record<string, number>;
};

const emptyStats = (): WorkStats => ({ leads: 0, calls: 0, accepted: 0, followups: 0, orders: 0, byResult: {} });

/** Counts one staff member's CRM activity for each of the given Tehran days
 *  ("YYYY-MM-DD"). Days with no activity come back as zeros. */
export async function getWorkStatsForUser(userId: number, days: string[]): Promise<Record<string, WorkStats>> {
  const database = await getDb();
  const out: Record<string, WorkStats> = Object.fromEntries(days.map((d) => [d, emptyStats()]));
  if (days.length === 0) return out;
  const first = days.reduce((a, b) => (a < b ? a : b));
  // Cheap pre-filter by creation time (UTC), then bucket by Tehran day.
  const sinceUtc = new Date(`${first}T00:00:00+03:30`).toISOString().slice(0, 19).replace("T", " ");

  const calls = await database
    .collection<CrmCallLog>("crm_calls")
    .find({ user_id: userId, created_at: { $gte: sinceUtc } }, { projection: { _id: 0 } })
    .toArray();
  for (const c of calls) {
    const st = out[tehranDayKey(c.created_at)];
    if (!st) continue;
    st.calls += 1;
    if (c.result === CRM_ACCEPT_RESULT) st.accepted += 1;
    st.byResult[c.result] = (st.byResult[c.result] ?? 0) + 1;
  }

  const leads = await database
    .collection<CrmLead>("crm_leads")
    .find({ created_by: userId, created_at: { $gte: sinceUtc } }, { projection: { created_at: 1 } })
    .toArray();
  for (const l of leads) {
    const st = out[tehranDayKey(l.created_at)];
    if (st) st.leads += 1;
  }

  const followed = await database
    .collection<CrmLead>("crm_leads")
    .find({ followup_by: userId, followup_done: true, followup_done_at: { $gte: sinceUtc } }, { projection: { followup_done_at: 1 } })
    .toArray();
  for (const l of followed) {
    const st = l.followup_done_at ? out[tehranDayKey(l.followup_done_at)] : undefined;
    if (st) st.followups += 1;
  }

  const orders = await database
    .collection<Inquiry>("inquiries")
    .find({ source: "manual", created_by: userId, created_at: { $gte: sinceUtc } }, { projection: { created_at: 1 } })
    .toArray();
  for (const o of orders) {
    const st = out[tehranDayKey(o.created_at)];
    if (st) st.orders += 1;
  }
  return out;
}
