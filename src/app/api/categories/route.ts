import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET() {
  if (!db) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const categories = await db
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));

    return Response.json({ categories });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
