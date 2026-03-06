import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { getAdminAuthContext } from "@/lib/auth/api-key";

export async function GET(request: NextRequest) {
  const context = await getAdminAuthContext(request);
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const submissions = await db
    .select()
    .from(schema.formSubmissions)
    .orderBy(desc(schema.formSubmissions.createdAt))
    .limit(limit)
    .offset(offset);

  const total = (await db.select().from(schema.formSubmissions)).length;

  return Response.json({ submissions, total });
}
