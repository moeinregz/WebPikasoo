// Phone number of the one account allowed to edit an existing CRM lead's
// business area/type and problem status after the fact (see
// updateCrmLeadAction in app/dashboard/actions.ts). Kept in its own tiny
// module — not actions.ts (a "use server" file, which can only export
// async functions) and not lib/db.ts — so both the server action's
// permission check and the dashboard page's "should I show the edit
// button" check import the exact same value instead of duplicating it.
export const MAIN_ADMIN_PHONE = "09965745535";
