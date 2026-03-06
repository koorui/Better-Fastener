import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { getAdminAuthContext } from "@/lib/auth/api-key";
import { logAdminAction } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminAuthContext(request);
  if (!context || context.type !== "user") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;

  await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, id));

  await logAdminAction({
    request,
    context,
    action: "delete",
    resource: "api_key",
    payload: { id },
  });

  return Response.json({ ok: true });
}

