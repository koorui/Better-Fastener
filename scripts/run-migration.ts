/**
 * 直接执行迁移 SQL（绕过 drizzle-kit push 的兼容性问题）
 * 运行: npm run db:migrate:run
 */
import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("请设置 DATABASE_URL 环境变量");
  process.exit(1);
}

const sqlFile = join(process.cwd(), "drizzle", "0000_tan_the_santerians.sql");
const sqlContent = readFileSync(sqlFile, "utf-8");

// 按 statement-breakpoint 分割，过滤空语句和注释
const statements = sqlContent
  .split(/--> statement-breakpoint\n?/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

async function run() {
  const client = postgres(connectionString!, { max: 1, prepare: false });
  console.log("执行迁移...");
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    try {
      await client.unsafe(stmt);
      console.log(`  ✓ 语句 ${i + 1}/${statements.length}`);
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code === "42P07") {
        console.log(`  ⏭ 表已存在，跳过`);
      } else {
        throw e;
      }
    }
  }
  console.log("迁移完成");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
