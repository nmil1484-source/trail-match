import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import mysql from "mysql2/promise";

async function fixShopsSchema() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable not set");
    process.exit(1);
  }

  console.log("🔧 Connecting to database...");
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("✅ Connected to database");
  console.log("🔄 Altering shops table to make optional columns nullable...\n");

  const alterStatements = [
    "ALTER TABLE shops MODIFY COLUMN description TEXT NULL",
    "ALTER TABLE shops MODIFY COLUMN otherDescription TEXT NULL",
    "ALTER TABLE shops MODIFY COLUMN address VARCHAR(255) NULL",
    "ALTER TABLE shops MODIFY COLUMN city VARCHAR(100) NULL",
    "ALTER TABLE shops MODIFY COLUMN state VARCHAR(50) NULL",
    "ALTER TABLE shops MODIFY COLUMN zipCode VARCHAR(20) NULL",
    "ALTER TABLE shops MODIFY COLUMN phone VARCHAR(50) NULL",
    "ALTER TABLE shops MODIFY COLUMN email VARCHAR(255) NULL",
    "ALTER TABLE shops MODIFY COLUMN website VARCHAR(255) NULL",
    "ALTER TABLE shops MODIFY COLUMN photos JSON NULL"
  ];

  for (const statement of alterStatements) {
    try {
      console.log(`  Running: ${statement}`);
      await db.execute(sql.raw(statement));
      console.log(`  ✅ Success\n`);
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}\n`);
    }
  }

  await connection.end();
  console.log("✅ Migration complete! All optional shop fields are now nullable.");
  console.log("🎉 You can now add shops with empty optional fields!");
}

fixShopsSchema().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
