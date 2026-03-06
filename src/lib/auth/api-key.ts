import type { NextRequest } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export type AdminAuthContext =
  | { type: "user"; userId: string; email: string }
  | { type: "apiKey"; apiKeyId: string; permissions: string[] }
  | null;

export function generateApiKey(): string {
  // 简单可读的前缀 + 随机 32 字节（64 位 hex）
  return `bfk_${randomBytes(32).toString("hex")}`;
}

export function hashApiKey(key: string): string {
  return createHash("sha512").update(key).digest("hex");
}

async function getApiKeyFromRequest(
  request: NextRequest
): Promise<{ id: string; permissions: string[] } | null> {
  if (!db) return null;

  const auth = request.headers.get("authorization");
  const headerKey =
    auth && auth.toLowerCase().startsWith("bearer ")
      ? auth.slice(7).trim()
      : request.headers.get("x-api-key")?.trim();

  if (!headerKey) return null;

  const keyHash = hashApiKey(headerKey);
  const rows = await db
    .select({
      id: schema.apiKeys.id,
      permissions: schema.apiKeys.permissions,
    })
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.keyHash, keyHash))
    .limit(1);

  if (rows.length === 0) return null;

  return {
    id: rows[0].id,
    permissions: rows[0].permissions ?? [],
  };
}

// 延迟导入，避免循环依赖
async function getSessionContext(): Promise<{
  userId: string;
  email: string;
} | null> {
  const { getSession } = await import("./index");
  return getSession();
}

export async function getAdminAuthContext(
  request: NextRequest
): Promise<AdminAuthContext> {
  // 1. 优先使用登录用户 Session（后台页面、普通管理操作）
  const session = await getSessionContext();
  if (session) {
    return { type: "user", userId: session.userId, email: session.email };
  }

  // 2. 其次尝试 API Key
  const apiKey = await getApiKeyFromRequest(request);
  if (apiKey) {
    return {
      type: "apiKey",
      apiKeyId: apiKey.id,
      permissions: apiKey.permissions,
    };
  }

  return null;
}

