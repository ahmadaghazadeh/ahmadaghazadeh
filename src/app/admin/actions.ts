"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfigured, endSession, passwordMatches, startSession } from "@/lib/admin-session";
import { registerFailedLogin, tooManyFailedLogins } from "@/lib/analytics-store";

export type LoginState = { error: string } | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { error: "Admin access is not configured." };
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-real-ip") || requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await tooManyFailedLogins(ip)) return { error: "Too many attempts. Try again in 15 minutes." };
  const password = formData.get("password");
  if (typeof password !== "string" || !passwordMatches(password)) {
    await registerFailedLogin(ip);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { error: "Incorrect password." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}
