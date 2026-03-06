/**
 * 插入示例商品和分类（用于测试）
 * 运行: npm run db:seed:sample
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, categories } from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("请设置 DATABASE_URL");
  process.exit(1);
}

const client = postgres(connectionString!, { max: 1, prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("插入示例分类...");
  await db.insert(categories).values([
    { slug: "automotive", name: "汽车紧固件", nameEn: "Automotive Fasteners", sortOrder: 0 },
    { slug: "cnc-parts", name: "CNC零件", nameEn: "CNC Parts", sortOrder: 1 },
  ]).onConflictDoNothing({ target: categories.slug });

  const cats = await db.select().from(categories);
  const catAuto = cats.find((c) => c.slug === "automotive");
  const catCnc = cats.find((c) => c.slug === "cnc-parts");

  console.log("插入示例商品...");
  await db.insert(products).values([
    {
      slug: "hex-bolt-m8",
      name: "六角螺栓 M8",
      nameEn: "Hex Bolt M8",
      description: "标准六角螺栓，规格 M8，适用于汽车及机械装配。",
      categoryId: catAuto?.id,
      seoTitle: "六角螺栓 M8 - Better Fasteners",
      seoDesc: "专业汽车用六角螺栓 M8，高品质紧固件。",
    },
    {
      slug: "stainless-steel-screw",
      name: "不锈钢螺丝",
      nameEn: "Stainless Steel Screw",
      description: "304 不锈钢螺丝，耐腐蚀，适用于户外及潮湿环境。",
      categoryId: catAuto?.id,
    },
    {
      slug: "cnc-machined-bracket",
      name: "CNC 加工支架",
      nameEn: "CNC Machined Bracket",
      description: "精密 CNC 加工支架，铝合金材质，高精度。",
      categoryId: catCnc?.id,
      specs: { material: "铝合金", tolerance: "±0.1mm" },
    },
  ]).onConflictDoNothing({ target: products.slug });

  console.log("完成");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
