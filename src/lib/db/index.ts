import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[DB] DATABASE_URL not set. Database operations will fail. Add DATABASE_URL to .env.local"
  );
}

// 使用 postgres.js，serverless 友好
// 对于 Vercel Postgres / Supabase / Neon 等，连接池模式下建议 prepare: false
const client = connectionString
  ? postgres(connectionString, {
      max: 10,
      prepare: false, // 事务池模式（如 Supabase、Neon）需要
    })
  : null;

export const db = client ? drizzle(client, { schema }) : null;
export { schema };
