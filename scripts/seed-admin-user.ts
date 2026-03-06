/**
 * 创建管理员用户
 * 运行: npm run db:seed:admin
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("请设置 DATABASE_URL");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@betterfastener.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123456";

async function seed() {
  const client = postgres(connectionString!, { max: 1, prepare: false });
  const db = drizzle(client);

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db
    .insert(users)
    .values({ email: ADMIN_EMAIL, passwordHash: hash })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash: hash, updatedAt: new Date() },
    });

  console.log(`管理员已创建: ${ADMIN_EMAIL}`);
  console.log(`密码: ${ADMIN_PASSWORD}`);
  console.log("请登录后立即修改密码！");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
