import { NextResponse } from "next/server";
import { runSeoAutomation } from "@/lib/seoAutomation";
import { getCurrentUser } from "@/lib/session";

// Writing an article takes a couple of minutes.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Vercel Cron (vercel.json) — sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runSeoAutomation("cron");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

/** «الان یه مقاله بساز» button in the dashboard (admin only). */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runSeoAutomation("manual");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
