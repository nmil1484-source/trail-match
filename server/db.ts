import { and, eq, gte, lte, sql, desc, ne, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertTrip, InsertTripParticipant, InsertUser, InsertVehicle, InsertShop, InsertShopReview, InsertTripReview, InsertPasswordResetToken, InsertConversation, InsertMessage, tripParticipants, trips, users, vehicles, shops, shopReviews, tripReviews, passwordResetTokens, conversations, messages } from "../drizzle/schema";
import { ENV } from './_core/env';
import crypto from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;
let _rawConnection: mysql.Connection | null = null;

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

export async function getRawConnection() {
  if (!_rawConnection && process.env.DATABASE_URL) {
    try {
      _rawConnection = await mysql.createConnection(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to create raw connection:", error);
      _rawConnection = null;
    }
  }
  return _rawConnection;
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
  if (!db) {
    console.log('getAllTrips: db is null');
    return [];
  }

  try {
    const allTrips = await db.select().from(trips);
    console.log('getAllTrips: found', allTrips.length, 'trips');
    
    // Filter for open trips only (and not private)
    const openTrips = allTrips.filter(trip => trip.status === 'open' && !trip.isPrivate);
    console.log('getAllTrips: open trips', openTrips.length);
    
    return openTrips;
  } catch (error) {
    console.error('getAllTrips error:', error);
    return [];
  }
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

export async function deleteAllTrips() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.delete(trips);
  return result;
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
    })
    .from(tripParticipants)
    .leftJoin(users, eq(tripParticipants.userId, users.id))
    .where(eq(tripParticipants.tripId, tripId));
}

export async function getPendingRequestsForOrganizer(organizerId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all trips organized by this user
  const organizerTrips = await db
    .select({ id: trips.id })
    .from(trips)
    .where(eq(trips.organizerId, organizerId));

  if (organizerTrips.length === 0) return [];

  const tripIds = organizerTrips.map(t => t.id);

  // Get all pending requests for those trips
  return await db
    .select({
      participant: tripParticipants,
      user: users,
      trip: trips,
    })
    .from(tripParticipants)
    .leftJoin(users, eq(tripParticipants.userId, users.id))
    .leftJoin(trips, eq(tripParticipants.tripId, trips.id))
    .where(
      and(
        eq(tripParticipants.status, "pending"),
        sql`${tripParticipants.tripId} IN (${sql.join(tripIds.map(id => sql`${id}`), sql`, `)})`
      )
    );
}

export async function getUserTripRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      participant: tripParticipants,
      trip: trips,
    })
    .from(tripParticipants)
    .leftJoin(trips, eq(tripParticipants.tripId, trips.id))
    .where(eq(tripParticipants.userId, userId))
    .orderBy(desc(tripParticipants.createdAt));
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
  const connection = await getRawConnection();
  if (!connection) throw new Error("Database not available");

  // Use raw mysql2 connection to bypass Drizzle completely
  const categoriesJson = JSON.stringify(shop.categories);
  const photosJson = shop.photos ? JSON.stringify(shop.photos) : '[]';
  
  const query = `
    INSERT INTO shops (
      addedBy, name, description, categories, otherDescription,
      address, city, state, zipCode, phone, email, website,
      averageRating, totalReviews, photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    shop.addedBy,
    shop.name,
    shop.description || null,
    categoriesJson,
    shop.otherDescription || null,
    shop.address || null,
    shop.city || null,
    shop.state || null,
    shop.zipCode || null,
    shop.phone || null,
    shop.email || null,
    shop.website || null,
    shop.averageRating ?? 0,
    shop.totalReviews ?? 0,
    photosJson
  ];
  
  const [result] = await connection.execute(query, values);
  return (result as any).insertId;
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
  
  let results = await query;
  
  // Filter by categories in-memory
  if (filters?.categories && filters.categories.length > 0) {
    results = results.filter(shop => {
      const shopCategories = shop.categories as string[];
      return filters.categories!.some(cat => shopCategories.includes(cat));
    });
  }
  
  // Sort: Premium first, then Featured, then regular shops
  // Also check if premium hasn't expired
  const now = new Date();
  results.sort((a, b) => {
    // Check if premium is expired
    const aIsActivePremium = a.premiumTier !== 'none' && 
      (!a.premiumExpiresAt || new Date(a.premiumExpiresAt) > now);
    const bIsActivePremium = b.premiumTier !== 'none' && 
      (!b.premiumExpiresAt || new Date(b.premiumExpiresAt) > now);
    
    // Priority: premium > featured > none
    const aPriority = aIsActivePremium ? (a.premiumTier === 'premium' ? 3 : 2) : 0;
    const bPriority = bIsActivePremium ? (b.premiumTier === 'premium' ? 3 : 2) : 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // Within same tier, verified shops come first
    if (a.isVerified !== b.isVerified) {
      return a.isVerified ? -1 : 1;
    }
    
    // Finally sort by rating
    return (b.averageRating || 0) - (a.averageRating || 0);
  });
  
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




/**
 * Upgrade trip to premium tier
 */
export async function upgradeTripToPremium(
  tripId: number,
  tier: 'featured' | 'premium',
  durationDays: number = 30
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  await db
    .update(trips)
    .set({
      premiumTier: tier,
      premiumExpiresAt: expiresAt,
    })
    .where(eq(trips.id, tripId));
}

/**
 * Check if trip premium status has expired and downgrade if needed
 */
export async function checkAndExpirePremiumTrips(): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const now = new Date();
  
  await db
    .update(trips)
    .set({
      premiumTier: 'free',
      premiumExpiresAt: null,
    })
    .where(
      and(
        ne(trips.premiumTier, 'free'),
        lt(trips.premiumExpiresAt, now)
      )
    );
}

/**
 * Fix shops table schema to allow NULL values for optional fields
 */
export async function fixShopsTableSchema(): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Run raw SQL to alter the table schema
  await db.execute(sql.raw(`
    ALTER TABLE shops
    MODIFY COLUMN description TEXT NULL,
    MODIFY COLUMN otherDescription TEXT NULL,
    MODIFY COLUMN address VARCHAR(255) NULL,
    MODIFY COLUMN city VARCHAR(100) NULL,
    MODIFY COLUMN state VARCHAR(50) NULL,
    MODIFY COLUMN zipCode VARCHAR(20) NULL,
    MODIFY COLUMN phone VARCHAR(20) NULL,
    MODIFY COLUMN email VARCHAR(255) NULL,
    MODIFY COLUMN website VARCHAR(255) NULL,
    MODIFY COLUMN photos JSON NULL
  `));
}

// ===== MESSAGING FUNCTIONS =====

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(user1Id: number, user2Id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Ensure user1Id is always the smaller ID for consistency
  const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  // Try to find existing conversation
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.user1Id, smallerId),
        eq(conversations.user2Id, largerId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new conversation
  const [result] = await db
    .insert(conversations)
    .values({
      user1Id: smallerId,
      user2Id: largerId,
    });

  return {
    id: (result as any).insertId,
    user1Id: smallerId,
    user2Id: largerId,
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const userConvos = await db
    .select({
      conversation: conversations,
      otherUser: users,
    })
    .from(conversations)
    .leftJoin(
      users,
      sql`CASE 
        WHEN ${conversations.user1Id} = ${userId} THEN ${users.id} = ${conversations.user2Id}
        ELSE ${users.id} = ${conversations.user1Id}
      END`
    )
    .where(
      sql`${conversations.user1Id} = ${userId} OR ${conversations.user2Id} = ${userId}`
    )
    .orderBy(desc(conversations.lastMessageAt));

  return userConvos;
}

/**
 * Send a message
 */
export async function sendMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Insert message
  const [result] = await db.insert(messages).values(data);

  // Update conversation's lastMessageAt
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  return {
    id: (result as any).insertId,
    ...data,
    createdAt: new Date(),
  };
}

/**
 * Get messages in a conversation
 */
export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      message: messages,
      sender: users,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      )
    );
}

/**
 * Get unread message count for a user
 */
export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(
      and(
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      )
    );

  return result[0]?.count || 0;
}

/**
 * Get or create a group conversation for a trip
 */
export async function getOrCreateTripGroupChat(tripId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Try to find existing group chat for this trip
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.tripId, tripId),
        eq(conversations.isGroup, true)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Get trip details for the title
  const trip = await getTripById(tripId);
  const title = trip ? `${trip.title} - Group Chat` : `Trip #${tripId} - Group Chat`;

  // Create new group conversation
  const [result] = await db.insert(conversations).values({
    tripId,
    isGroup: true,
    title,
    user1Id: null,
    user2Id: null,
    lastMessageAt: new Date(),
  });

  return {
    id: (result as any).insertId,
    tripId,
    isGroup: true,
    title,
    user1Id: null,
    user2Id: null,
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get trip group chat messages
 */
export async function getTripGroupMessages(tripId: number) {
  const db = await getDb();
  if (!db) return [];

  // First get the conversation
  const convo = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.tripId, tripId),
        eq(conversations.isGroup, true)
      )
    )
    .limit(1);

  if (convo.length === 0) return [];

  // Get messages
  const msgs = await db
    .select({
      message: messages,
      sender: users,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, convo[0].id))
    .orderBy(messages.createdAt);

  return msgs.map(m => ({
    ...m.message,
    senderName: m.sender?.name || "Unknown",
  }));
}

/**
 * Send message to trip group chat
 */
export async function sendTripGroupMessage(tripId: number, senderId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get or create group chat
  const conversation = await getOrCreateTripGroupChat(tripId);

  // Insert message (receiverId is 0 for group messages)
  const [result] = await db.insert(messages).values({
    conversationId: conversation.id,
    senderId,
    receiverId: 0, // 0 indicates group message
    content,
    isRead: false,
  });

  // Update conversation's lastMessageAt
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversation.id));

  return {
    id: (result as any).insertId,
    conversationId: conversation.id,
    senderId,
    receiverId: 0,
    content,
    isRead: false,
    createdAt: new Date(),
  };
}

/**
 * Check if user is participant in trip (for group chat access)
 */
export async function isUserTripParticipant(userId: number, tripId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Check if user is trip organizer
  const trip = await getTripById(tripId);
  if (trip?.userId === userId) return true;

  // Check if user is accepted participant
  const participant = await db
    .select()
    .from(tripParticipants)
    .where(
      and(
        eq(tripParticipants.tripId, tripId),
        eq(tripParticipants.userId, userId),
        eq(tripParticipants.status, "accepted")
      )
    )
    .limit(1);

  return participant.length > 0;
}

// ===== TRIP REVIEW FUNCTIONS =====

export async function createTripReview(review: InsertTripReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tripReviews).values(review);
  return result[0].insertId;
}

export async function getTripReviews(tripId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      review: tripReviews,
      user: users,
    })
    .from(tripReviews)
    .leftJoin(users, eq(tripReviews.userId, users.id))
    .where(eq(tripReviews.tripId, tripId))
    .orderBy(desc(tripReviews.createdAt));
}

export async function getUserTripReview(tripId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(tripReviews)
    .where(and(eq(tripReviews.tripId, tripId), eq(tripReviews.userId, userId)))
    .limit(1);

  return result[0] || null;
}

export async function getOrganizerReviews(organizerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      review: tripReviews,
      user: users,
      trip: trips,
    })
    .from(tripReviews)
    .leftJoin(users, eq(tripReviews.userId, users.id))
    .leftJoin(trips, eq(tripReviews.tripId, trips.id))
    .where(eq(tripReviews.organizerId, organizerId))
    .orderBy(desc(tripReviews.createdAt));
}

export async function updateShopReview(reviewId: number, data: {
  rating?: number;
  reviewText?: string;
  serviceType?: string;
  wouldRecommend?: boolean;
}) {
  const result = await db
    .update(shopReviews)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(shopReviews.id, reviewId))
    .returning();
  return result[0];
}

export async function updateTripReview(reviewId: number, data: {
  rating?: number;
  reviewText?: string;
  organizationRating?: number;
  communicationRating?: number;
  wouldJoinAgain?: boolean;
}) {
  const result = await db
    .update(tripReviews)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tripReviews.id, reviewId))
    .returning();
  return result[0];
}

// ===== SHOP VERIFICATION & PREMIUM FUNCTIONS =====

/**
 * Update shop verification status (admin only)
 */
export async function updateShopVerification(shopId: number, isVerified: boolean, adminId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(shops).set({
    isVerified,
    verifiedAt: isVerified ? new Date() : null,
    verifiedBy: isVerified ? adminId : null,
  }).where(eq(shops.id, shopId));
}

/**
 * Update shop premium tier (admin only)
 */
export async function updateShopPremiumTier(shopId: number, premiumTier: "none" | "featured" | "premium", expiresAt: Date | null): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(shops).set({
    premiumTier,
    premiumExpiresAt: expiresAt,
  }).where(eq(shops.id, shopId));
}

/**
 * Check and expire premium shops (run periodically)
 */
export async function checkAndExpirePremiumShops(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  
  // Find expired premium shops
  await db.update(shops)
    .set({
      premiumTier: "none",
      premiumExpiresAt: null,
    })
    .where(
      and(
        ne(shops.premiumTier, "none"),
        lt(shops.premiumExpiresAt, now)
      )
    );
}
