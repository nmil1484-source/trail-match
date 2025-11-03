import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createEmailUser(email: string, password: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await hashPassword(password);
  
  // Generate a unique openId for email users (use email-based hash)
  const openId = `email_${Buffer.from(email).toString('base64').replace(/=/g, '')}`;
  
  const [user] = await db.insert(users).values({
    email,
    passwordHash,
    name: name || email.split("@")[0],
    loginMethod: "email",
    role: "user",
    openId,
  }).$returningId();

  return user;
}

export async function authenticateEmailUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Generate openId if missing (for users created before openId was added)
  if (!user.openId) {
    const openId = `email_${Buffer.from(email).toString('base64').replace(/=/g, '')}`;
    await db.update(users).set({ 
      lastSignedIn: new Date(),
      openId 
    }).where(eq(users.id, user.id));
    user.openId = openId;
  } else {
    // Update last signed in
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  }

  return user;
}

