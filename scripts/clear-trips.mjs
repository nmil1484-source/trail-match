#!/usr/bin/env node
/**
 * Clear all trips from the database while preserving users
 * Run this script from Railway or locally with DATABASE_URL set
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { trips, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: MYSQL_URL or DATABASE_URL environment variable not set');
  process.exit(1);
}

async function clearTrips() {
  console.log('Connecting to database...');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  console.log('✓ Connected successfully!\n');
  
  try {
    // Count trips before deletion
    const allTrips = await db.select().from(trips);
    const tripCount = allTrips.length;
    console.log(`Found ${tripCount} trips in the database`);
    
    if (tripCount === 0) {
      console.log('No trips to delete!');
      await connection.end();
      return;
    }
    
    // Delete all trips
    console.log(`\nDeleting all ${tripCount} trips...`);
    await db.delete(trips);
    
    // Verify deletion
    const remainingTrips = await db.select().from(trips);
    const allUsers = await db.select().from(users);
    
    console.log('\n✅ SUCCESS!');
    console.log(`   - Deleted: ${tripCount} trips`);
    console.log(`   - Remaining trips: ${remainingTrips.length}`);
    console.log(`   - Users preserved: ${allUsers.length}`);
    console.log('\nYour database is now clean and ready for production launch! 🚀');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

clearTrips().catch((error) => {
  console.error('Failed to clear trips:', error);
  process.exit(1);
});
