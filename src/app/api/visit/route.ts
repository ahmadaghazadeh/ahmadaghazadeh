import { after } from "next/server";
import { isAdmin } from "@/lib/admin-session";
import { recordVisit } from "@/lib/analytics-store";

export const runtime = "nodejs";

function sameSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get("host"); }
  catch { return false; }
}

export async function POST(request: Request) {
  if (!sameSite(request)) return new Response(null, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  const visitorId = body && typeof body === "object" && "visitorId" in body ? body.visitorId : undefined;
  if (typeof visitorId !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(visitorId)) return new Response(null, { status: 400 });
  if (!(await isAdmin())) after(() => recordVisit(visitorId));
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
