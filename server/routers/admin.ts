import { Router } from "express";
import { getRawConnection } from "../db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * Admin-only endpoint to migrate shops table schema
 * Changes 'category' column to 'categories' with JSON type
 */
router.post("/migrate-shops-schema", requireAdmin, async (req, res) => {
  try {
    const connection = await getRawConnection();
    if (!connection) {
      return res.status(500).json({ 
        success: false, 
        error: "Database connection not available" 
      });
    }

    const steps: string[] = [];

    // Step 1: Add new 'categories' column as JSON
    try {
      await connection.execute(`
        ALTER TABLE shops 
        ADD COLUMN categories JSON NULL
      `);
      steps.push("✅ Added 'categories' column as JSON");
    } catch (error: any) {
      if (error.message.includes("Duplicate column name")) {
        steps.push("⚠️ 'categories' column already exists, skipping");
      } else {
        throw error;
      }
    }

    // Step 2: Migrate data from 'category' to 'categories'
    // Convert single category string to JSON array
    try {
      await connection.execute(`
        UPDATE shops 
        SET categories = JSON_ARRAY(category)
        WHERE category IS NOT NULL AND categories IS NULL
      `);
      steps.push("✅ Migrated data from 'category' to 'categories'");
    } catch (error: any) {
      steps.push(`⚠️ Data migration: ${error.message}`);
    }

    // Step 3: Drop old 'category' column
    try {
      await connection.execute(`
        ALTER TABLE shops 
        DROP COLUMN category
      `);
      steps.push("✅ Dropped old 'category' column");
    } catch (error: any) {
      if (error.message.includes("Can't DROP")) {
        steps.push("⚠️ 'category' column already dropped, skipping");
      } else {
        throw error;
      }
    }

    // Step 4: Make 'categories' NOT NULL with default
    try {
      await connection.execute(`
        ALTER TABLE shops 
        MODIFY COLUMN categories JSON NOT NULL
      `);
      steps.push("✅ Made 'categories' column NOT NULL");
    } catch (error: any) {
      steps.push(`⚠️ Setting NOT NULL: ${error.message}`);
    }

    // Step 5: Make optional columns nullable
    const optionalColumns = [
      'description',
      'otherDescription',
      'address',
      'city',
      'state',
      'zipCode',
      'phone',
      'email',
      'website',
      'photos'
    ];

    for (const column of optionalColumns) {
      try {
        let columnType = 'TEXT';
        if (['city', 'state', 'zipCode', 'phone'].includes(column)) {
          columnType = 'VARCHAR(255)';
        } else if (column === 'email') {
          columnType = 'VARCHAR(320)';
        } else if (column === 'photos') {
          columnType = 'JSON';
        }

        await connection.execute(`
          ALTER TABLE shops 
          MODIFY COLUMN ${column} ${columnType} NULL
        `);
        steps.push(`✅ Made '${column}' nullable`);
      } catch (error: any) {
        steps.push(`⚠️ Making '${column}' nullable: ${error.message}`);
      }
    }

    res.json({ 
      success: true, 
      message: "Migration completed successfully",
      steps 
    });

  } catch (error: any) {
    console.error("[Admin] Migration error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

export default router;
