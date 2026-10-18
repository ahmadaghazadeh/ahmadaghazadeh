import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
export const MIN_PASSWORD_LENGTH = 12;

function adminPassword() {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value && value.length >= MIN_PASSWORD_LENGTH ? value : null;
}

// Deriving the signing key from the password means changing it signs out every session.
function sign(payload: string, password: string) {
  const key = createHash("sha256").update(`admin-session:${password}`).digest();
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function equal(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export const adminConfigured = () => adminPassword() !== null;

export function passwordMatches(candidate: string) {
  const password = adminPassword();
  return password !== null && equal(candidate, password);
}

export async function isAdmin() {
  const password = adminPassword();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!password || !token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  return equal(signature, sign(expires, password));
}

export async function startSession() {
  const password = adminPassword();
  if (!password) return;
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, password)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
