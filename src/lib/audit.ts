import type { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import type { AdminAuthContext } from "@/lib/auth/api-key";

function getIpFromRequest(request: NextRequest): string | null {
  // Node runtime 下可以优先使用 request.ip，再退回 header
  // @ts-expect-error: ip 仅在部分环境存在
  const directIp: string | undefined = request.ip;
  if (directIp) return directIp;

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp ?? null;
}

export async function logAdminAction(options: {
  request: NextRequest;
  context: AdminAuthContext;
  action: string;
  resource: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  if (!db) return;

  const { request, context, action, resource, payload } = options;

  if (!context) {
    // 未认证的调用不记录（通常已在接口返回 401）
    return;
  }

  const ip = getIpFromRequest(request);

  await db.insert(schema.adminAuditLogs).values({
    apiKeyId: context.type === "apiKey" ? context.apiKeyId : null,
    userId: context.type === "user" ? context.userId : null,
    action,
    resource,
    payload: payload ?? null,
    ip: ip ?? null,
  });
}

