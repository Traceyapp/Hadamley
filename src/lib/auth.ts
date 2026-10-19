import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "./db";
import { verifyPassword } from "./password";
import type { AdminUser } from "./types";

/**
 * Local admin sessions: an HMAC-signed cookie. In production this is
 * replaced by Supabase Auth (email login) with row-level security; the
 * requireAdmin() guard is the single place to swap.
 */

const COOKIE = "hadamley_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters). See .env.example.");
  return s;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function createSession(email: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function currentAdmin(): Promise<Omit<AdminUser, "passwordHash"> | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email: string; exp: number };
    if (exp < Date.now() / 1000) return null;
    const user = readDb().admins.find((a) => a.email === email);
    if (!user) return null; // removed accounts lose access immediately
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export function checkCredentials(email: string, password: string) {
  const user = readDb().admins.find((a) => a.email === email.trim().toLowerCase());
  // Always run a hash comparison to keep timing similar for unknown emails.
  const ok = verifyPassword(password, user?.passwordHash ?? "scrypt$00$00");
  return ok && user ? user : null;
}
