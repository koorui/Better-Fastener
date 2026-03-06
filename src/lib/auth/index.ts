import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db";
import { eq, and, gt } from "drizzle-orm";

const SESSION_COOKIE = "admin_session";
const SESSION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  if (!db) throw new Error("Database unavailable");
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  await db.insert(schema.sessions).values({
    userId,
    token,
    expiresAt,
  });
  return token;
}

export async function getSession(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !db) return null;

  const result = await db
    .select({
      userId: schema.sessions.userId,
      expiresAt: schema.sessions.expiresAt,
      email: schema.users.email,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.token, token), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);

  if (result.length === 0) return null;
  return { userId: result[0].userId, email: result[0].email };
}

export async function deleteSession(token: string): Promise<void> {
  if (!db) return;
  await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: false; error: string } | { ok: true; sessionToken: string }> {
  if (!db) return { ok: false, error: "Database unavailable" };
  const users = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (users.length === 0) return { ok: false, error: "邮箱或密码错误" };
  const user = users[0];
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, error: "邮箱或密码错误" };
  const sessionToken = await createSession(user.id);
  return { ok: true, sessionToken };
}

export { SESSION_COOKIE };
