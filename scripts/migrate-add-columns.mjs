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
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS styles JSON',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS minTireSize VARCHAR(50)',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS requiresWinch BOOLEAN DEFAULT FALSE',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS requiresLockers BOOLEAN DEFAULT FALSE',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS photos JSON',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS itinerary TEXT',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS campingInfo TEXT',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS communicationMethods JSON',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS phoneNumber VARCHAR(50)',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS whatsappNumber VARCHAR(50)',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS facebookHandle VARCHAR(255)',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS instagramHandle VARCHAR(255)',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS isPrivate BOOLEAN DEFAULT FALSE NOT NULL',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS shareToken VARCHAR(64)',
      "ALTER TABLE trips ADD COLUMN IF NOT EXISTS premiumTier ENUM('free', 'featured', 'premium') DEFAULT 'free' NOT NULL",
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS premiumExpiresAt TIMESTAMP NULL',
      'ALTER TABLE trips ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL',
    ];
    
    for (const migration of tripsMigrations) {
      try {
        await connection.query(migration);
        console.log(`  ✅ ${migration.substring(0, 60)}...`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ⏭️  Column already exists, skipping...`);
        } else {
          console.error(`  ❌ Error: ${error.message}`);
        }
      }
    }
    
    // Add columns to tripParticipants table
    console.log('\n📝 Adding columns to tripParticipants table...');
    
    const participantsMigrations = [
      'ALTER TABLE tripParticipants ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL',
    ];
    
    for (const migration of participantsMigrations) {
      try {
        await connection.query(migration);
        console.log(`  ✅ ${migration.substring(0, 60)}...`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ⏭️  Column already exists, skipping...`);
        } else {
          console.error(`  ❌ Error: ${error.message}`);
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
