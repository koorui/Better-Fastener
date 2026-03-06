import { NextRequest } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return Response.json({ error: "请输入邮箱和密码" }, { status: 400 });
    }
    const result = await login(String(email).trim(), String(password));
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 401 });
    }
    return Response.json({ sessionToken: result.sessionToken });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
