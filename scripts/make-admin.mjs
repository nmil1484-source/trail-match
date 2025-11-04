#!/usr/bin/env node
/**
 * Promote a user to admin role by email
 * Usage: node scripts/make-admin.mjs <email>
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.MYSQL_URL || process.env.DATABASE_URL;
const email = process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ Error: MYSQL_URL or DATABASE_URL environment variable not set');
  process.exit(1);
}

if (!email) {
  console.error('❌ Error: Please provide an email address');
  console.error('Usage: node scripts/make-admin.mjs <email>');
  process.exit(1);
}

async function makeAdmin() {
  console.log(`Looking for user with email: ${email}...`);
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  try {
    // Find user by email
    const userList = await db.select().from(users).where(eq(users.email, email));
    
    if (userList.length === 0) {
      console.error(`❌ No user found with email: ${email}`);
      await connection.end();
      process.exit(1);
    }
    
    const user = userList[0];
    console.log(`✓ Found user: ${user.name || user.email} (ID: ${user.id})`);
    
    if (user.role === 'admin') {
      console.log('ℹ️  User is already an admin!');
      await connection.end();
      return;
    }
    
    // Update user role to admin
    console.log('Promoting user to admin...');
    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, user.id));
    
    console.log('\n✅ SUCCESS!');
    console.log(`   ${user.name || user.email} is now an admin!`);
    console.log('\nYou can now log in and access admin features.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

makeAdmin().catch((error) => {
  console.error('Failed to promote user:', error);
  process.exit(1);
});
