import { NextRequest } from "next/server";
import { deleteSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  const res = Response.json({ ok: true });
  res.headers.set("Set-Cookie", `${SESSION_COOKIE}=; path=/; max-age=0`);
  return res;
}
