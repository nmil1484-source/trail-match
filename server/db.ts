import { and, eq, gte, lte, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertTrip, InsertTripParticipant, InsertUser, InsertVehicle, InsertShop, InsertShopReview, InsertPasswordResetToken, tripParticipants, trips, users, vehicles, shops, shopReviews, passwordResetTokens } from "../drizzle/schema";
import { ENV } from './_core/env';
import crypto from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER FUNCTIONS =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "location", "bio", "profilePhoto"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.experienceLevel !== undefined) {
      values.experienceLevel = user.experienceLevel;
      updateSet.experienceLevel = user.experienceLevel;
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(data: { email: string; passwordHash: string; name: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });
  
  const userId = result[0].insertId;
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user[0];
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
}

// ===== VEHICLE FUNCTIONS =====

export async function createVehicle(vehicle: InsertVehicle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vehicles).values(vehicle);
  return result[0].insertId;
}

export async function getVehiclesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
}

export async function getVehicleById(vehicleId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateVehicle(vehicleId: number, data: Partial<InsertVehicle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(vehicles).set(data).where(eq(vehicles.id, vehicleId));
}

export async function deleteVehicle(vehicleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(vehicles).where(eq(vehicles.id, vehicleId));
}

// ===== TRIP FUNCTIONS =====

export async function createTrip(trip: InsertTrip) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(trips).values(trip);
  return result[0].insertId;
}

export async function getAllTrips() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(trips).where(eq(trips.status, "open")).orderBy(sql`${trips.startDate} ASC`);
}

export async function getTripById(tripId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTripsByOrganizer(organizerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(trips).where(eq(trips.organizerId, organizerId));
}

export async function updateTrip(tripId: number, data: Partial<InsertTrip>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(trips).set(data).where(eq(trips.id, tripId));
}

export async function deleteTrip(tripId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(trips).where(eq(trips.id, tripId));
}

// ===== TRIP PARTICIPANT FUNCTIONS =====

export async function requestJoinTrip(participant: InsertTripParticipant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tripParticipants).values(participant);
  return result[0].insertId;
}

export async function getTripParticipants(tripId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      participant: tripParticipants,
      user: users,
      vehicle: vehicles,
    })
    .from(tripParticipants)
    .leftJoin(users, eq(tripParticipants.userId, users.id))
    .leftJoin(vehicles, eq(tripParticipants.vehicleId, vehicles.id))
    .where(eq(tripParticipants.tripId, tripId));
}

export async function updateParticipantStatus(participantId: number, status: "pending" | "accepted" | "declined") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tripParticipants).set({ status }).where(eq(tripParticipants.id, participantId));
}

export async function getUserTrips(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      trip: trips,
      participant: tripParticipants,
    })
    .from(tripParticipants)
    .leftJoin(trips, eq(tripParticipants.tripId, trips.id))
    .where(and(eq(tripParticipants.userId, userId), eq(tripParticipants.status, "accepted")));
}


// ===== SHOP FUNCTIONS =====

export async function createShop(shop: InsertShop) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(shops).values(shop);
  return result[0].insertId;
}

export async function getShops(filters?: { categories?: string[]; state?: string; city?: string }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(shops);
  
  const conditions = [];
  // For categories, we need to check if the shop's categories array contains any of the filter categories
  // Since we're using JSON, we'll filter in-memory for simplicity
  if (filters?.state) conditions.push(eq(shops.state, filters.state));
  if (filters?.city) conditions.push(eq(shops.city, filters.city));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const results = await query;
  
  // Filter by categories in-memory
  if (filters?.categories && filters.categories.length > 0) {
    return results.filter(shop => {
      const shopCategories = shop.categories as string[];
      return filters.categories!.some(cat => shopCategories.includes(cat));
    });
  }
  
  return results;
}

export async function getShopById(shopId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
  return result[0] || null;
}

export async function updateShop(shopId: number, updates: Partial<InsertShop>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(shops).set(updates).where(eq(shops.id, shopId));
}

// ===== SHOP REVIEW FUNCTIONS =====

export async function createShopReview(review: InsertShopReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(shopReviews).values(review);
  
  // Update shop's average rating and review count
  await updateShopRating(review.shopId);
  
  return result[0].insertId;
}

export async function getShopReviews(shopId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      review: shopReviews,
      user: users,
    })
    .from(shopReviews)
    .leftJoin(users, eq(shopReviews.userId, users.id))
    .where(eq(shopReviews.shopId, shopId))
    .orderBy(desc(shopReviews.createdAt));
}

async function updateShopRating(shopId: number) {
  const db = await getDb();
  if (!db) return;

  const reviews = await db.select().from(shopReviews).where(eq(shopReviews.shopId, shopId));
  
  if (reviews.length === 0) {
    await db.update(shops).set({ averageRating: 0, totalReviews: 0 }).where(eq(shops.id, shopId));
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round((totalRating / reviews.length) * 10); // Store as 0-50 (0.0-5.0 * 10)

  await db.update(shops).set({
    averageRating,
    totalReviews: reviews.length,
  }).where(eq(shops.id, shopId));
}



// ===== PASSWORD RESET TOKEN FUNCTIONS =====



/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex");
  
  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const resetToken: InsertPasswordResetToken = {
    userId,
    token,
    expiresAt,
    used: false,
  };

  await db.insert(passwordResetTokens).values(resetToken);

  return token;
}

/**
 * Verify and consume a password reset token
 * Returns the userId if valid, null if invalid/expired/used
 */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const resetToken = result[0];

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    return null;
  }

  // Check if token has been used
  if (resetToken.used) {
    return null;
  }

  // Mark token as used
  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.token, token));

  return resetToken.userId;
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}



// ===== ADMIN FUNCTIONS =====

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

/**
 * Get all trips (admin only)
 */
export async function getAllTripsAdmin() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const results = await db
    .select({
      trip: trips,
      organizer: users,
    })
    .from(trips)
    .leftJoin(users, eq(trips.organizerId, users.id))
    .orderBy(desc(trips.createdAt));

  return results.map((r) => ({
    ...r.trip,
    organizer: r.organizer,
  }));
}

/**
 * Get all shops (admin only)
 */
export async function getAllShopsAdmin() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const results = await db
    .select({
      shop: shops,
      addedByUser: users,
    })
    .from(shops)
    .leftJoin(users, eq(shops.addedBy, users.id))
    .orderBy(desc(shops.createdAt));

  return results.map((r) => ({
    ...r.shop,
    addedByUser: r.addedByUser,
  }));
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(users).where(eq(users.id, userId));
}



/**
 * Delete shop (admin only)
 */
export async function deleteShop(shopId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(shops).where(eq(shops.id, shopId));
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: number, role: "user" | "admin"): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

