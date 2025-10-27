import { and, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertTrip, InsertTripParticipant, InsertUser, InsertVehicle, tripParticipants, trips, users, vehicles } from "../drizzle/schema";
import { ENV } from './_core/env';

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

export async function createEmailUser(userData: { email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values({
    email: userData.email,
    name: userData.name,
    passwordHash: userData.passwordHash,
    loginMethod: "email",
    emailVerified: false,
    lastSignedIn: new Date(),
  });
  
  return result[0].insertId;
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

