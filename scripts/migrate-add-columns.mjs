#!/usr/bin/env node
/**
 * Migration script to add missing columns to production database
 * Run this script to sync the database with the schema definitions
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Add columns to trips table
    console.log('📝 Adding columns to trips table...');
    
    const tripsMigrations = [
      { column: 'styles', sql: 'ALTER TABLE trips ADD COLUMN styles JSON' },
      { column: 'minTireSize', sql: 'ALTER TABLE trips ADD COLUMN minTireSize VARCHAR(50)' },
      { column: 'requiresWinch', sql: 'ALTER TABLE trips ADD COLUMN requiresWinch BOOLEAN DEFAULT FALSE' },
      { column: 'requiresLockers', sql: 'ALTER TABLE trips ADD COLUMN requiresLockers BOOLEAN DEFAULT FALSE' },
      { column: 'photos', sql: 'ALTER TABLE trips ADD COLUMN photos JSON' },
      { column: 'itinerary', sql: 'ALTER TABLE trips ADD COLUMN itinerary TEXT' },
      { column: 'campingInfo', sql: 'ALTER TABLE trips ADD COLUMN campingInfo TEXT' },
      { column: 'communicationMethods', sql: 'ALTER TABLE trips ADD COLUMN communicationMethods JSON' },
      { column: 'phoneNumber', sql: 'ALTER TABLE trips ADD COLUMN phoneNumber VARCHAR(50)' },
      { column: 'whatsappNumber', sql: 'ALTER TABLE trips ADD COLUMN whatsappNumber VARCHAR(50)' },
      { column: 'facebookHandle', sql: 'ALTER TABLE trips ADD COLUMN facebookHandle VARCHAR(255)' },
      { column: 'instagramHandle', sql: 'ALTER TABLE trips ADD COLUMN instagramHandle VARCHAR(255)' },
      { column: 'isPrivate', sql: 'ALTER TABLE trips ADD COLUMN isPrivate BOOLEAN DEFAULT FALSE NOT NULL' },
      { column: 'shareToken', sql: 'ALTER TABLE trips ADD COLUMN shareToken VARCHAR(64)' },
      { column: 'premiumTier', sql: "ALTER TABLE trips ADD COLUMN premiumTier ENUM('free', 'featured', 'premium') DEFAULT 'free' NOT NULL" },
      { column: 'premiumExpiresAt', sql: 'ALTER TABLE trips ADD COLUMN premiumExpiresAt TIMESTAMP NULL' },
      { column: 'updatedAt', sql: 'ALTER TABLE trips ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL' },
    ];
    
    for (const migration of tripsMigrations) {
      try {
        await connection.query(migration.sql);
        console.log(`  ✅ Added column: ${migration.column}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ⏭️  Column '${migration.column}' already exists, skipping...`);
        } else {
          console.error(`  ❌ Error adding ${migration.column}: ${error.message}`);
        }
      }
    }
    
    // Add columns to tripParticipants table
    console.log('\n📝 Adding columns to tripParticipants table...');
    
    const participantsMigrations = [
      { column: 'updatedAt', sql: 'ALTER TABLE tripParticipants ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL' },
    ];
    
    for (const migration of participantsMigrations) {
      try {
        await connection.query(migration.sql);
        console.log(`  ✅ Added column: ${migration.column}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ⏭️  Column '${migration.column}' already exists, skipping...`);
        } else {
          console.error(`  ❌ Error adding ${migration.column}: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
