/**
 * 默认数据种子脚本
 * 运行: npm run db:seed
 * 需要先设置 DATABASE_URL（.env.local 或环境变量）
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { siteSettings } from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("请设置 DATABASE_URL 环境变量");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(client);

const defaultSettings = [
  { key: "contact_phone", value: "+86 21-52049658" },
  { key: "contact_email", value: "info@betterfastener.com" },
  { key: "address", value: "Shanghai, Shanghai Shi 200434, China" },
  { key: "site_name", value: "Better Fasteners Co., Ltd." },
  { key: "site_name_en", value: "Better Fasteners Co., Ltd." },
];

async function seed() {
  console.log("插入默认站点设置...");
  for (const s of defaultSettings) {
    await db
      .insert(siteSettings)
      .values({ ...s, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: s.value, updatedAt: new Date() },
      });
  }
  console.log("完成");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
