import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { getAdminAuthContext, generateApiKey, hashApiKey } from "@/lib/auth/api-key";
import { logAdminAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const context = await getAdminAuthContext(request);
  // 只允许登录用户管理 API Key，不允许 API Key 自己管理
  if (!context || context.type !== "user") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const rows = await db
    .select({
      id: schema.apiKeys.id,
      name: schema.apiKeys.name,
      permissions: schema.apiKeys.permissions,
      createdAt: schema.apiKeys.createdAt,
    })
    .from(schema.apiKeys);

  return Response.json({ apiKeys: rows });
}

export async function POST(request: NextRequest) {
  const context = await getAdminAuthContext(request);
  if (!context || context.type !== "user") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim().length > 0 ? body.name.trim() : "Unnamed Key";
  const permissions: string[] = Array.isArray(body.permissions)
    ? body.permissions.filter((p: unknown) => typeof p === "string")
    : [];

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);

  const [row] = await db
    .insert(schema.apiKeys)
    .values({
      keyHash,
      name,
      permissions,
    })
    .returning({
      id: schema.apiKeys.id,
      createdAt: schema.apiKeys.createdAt,
    });

  await logAdminAction({
    request,
    context,
    action: "create",
    resource: "api_key",
    payload: { id: row.id, name, permissions },
  });

  // 只在创建时返回明文 key
  return Response.json({
    id: row.id,
    name,
    permissions,
    createdAt: row.createdAt,
    key: rawKey,
  });
}

