import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { getAdminAuthContext } from "@/lib/auth/api-key";
import { logAdminAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const context = await getAdminAuthContext(request);
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
  const rows = await db.select().from(schema.siteSettings);
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value ?? "";
  }
  return Response.json(settings);
}

export async function PUT(request: NextRequest) {
  const context = await getAdminAuthContext(request);
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
  const body = await request.json();
  const keys = [
    "contact_phone",
    "contact_email",
    "address",
    "site_name",
    "site_name_en",
  ];
  const updatedKeys: string[] = [];
  for (const key of keys) {
    if (typeof body[key] === "string") {
      await db
        .insert(schema.siteSettings)
        .values({ key, value: body[key], updatedAt: new Date() })
        .onConflictDoUpdate({
          target: schema.siteSettings.key,
          set: { value: body[key], updatedAt: new Date() },
        });
      updatedKeys.push(key);
    }
  }

  await logAdminAction({
    request,
    context,
    action: "update",
    resource: "site_settings",
    payload: { keys: updatedKeys },
  });
  return Response.json({ ok: true });
}
