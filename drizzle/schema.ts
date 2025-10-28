import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // User profile fields
  location: varchar("location", { length: 255 }),
  experienceLevel: mysqlEnum("experienceLevel", ["beginner", "intermediate", "advanced", "expert"]),
  bio: text("bio"),
  profilePhoto: text("profilePhoto"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vehicles table - stores user vehicle information
 */
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Basic vehicle info
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year").notNull(),
  
  // Build details
  buildLevel: mysqlEnum("buildLevel", ["stock", "mild", "moderate", "heavy"]).default("stock").notNull(),
  liftHeight: varchar("liftHeight", { length: 50 }), // e.g., "3.5 inches"
  tireSize: varchar("tireSize", { length: 50 }), // e.g., "35x12.5"
  
  // Modifications (boolean flags)
  hasWinch: boolean("hasWinch").default(false),
  hasLockers: boolean("hasLockers").default(false),
  hasArmor: boolean("hasArmor").default(false),
  hasSuspensionUpgrade: boolean("hasSuspensionUpgrade").default(false),
  
  // Additional details
  modsList: text("modsList"), // User-entered list of modifications
  modifications: json("modifications"), // Array of modification details
  photos: json("photos"), // Array of photo URLs
  capabilityScore: int("capabilityScore").default(0), // Calculated score
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Trips table - stores trip postings
 */
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  
  // Trip basics
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  state: varchar("state", { length: 50 }),
  
  // Dates
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  
  // Trip characteristics
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
  styles: json("styles"), // Array of styles: ["rock_crawling", "overland", "desert", etc.]
  
  // Group details
  maxParticipants: int("maxParticipants").default(6),
  currentParticipants: int("currentParticipants").default(1),
  
  // Requirements - vehicle capability needed
  vehicleRequirement: mysqlEnum("vehicleRequirement", [
    "2wd",
    "4x4_stock", 
    "4x4_modded",
    "2wd_prerunner",
    "4wd_prerunner",
    "raptor",
    "long_travel_fast",
    "long_travel_slow"
  ]),
  minTireSize: varchar("minTireSize", { length: 50 }),
  requiresWinch: boolean("requiresWinch").default(false),
  requiresLockers: boolean("requiresLockers").default(false),
  
  // Additional info
  photos: json("photos"), // Array of photo URLs
  itinerary: text("itinerary"),
  campingInfo: text("campingInfo"),
  
  // Status
  status: mysqlEnum("status", ["open", "full", "completed", "cancelled"]).default("open").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

/**
 * Trip participants - tracks join requests and accepted members
 */
export const tripParticipants = mysqlTable("tripParticipants", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(),
  vehicleId: int("vehicleId").notNull(),
  
  status: mysqlEnum("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
  message: text("message"), // Optional message when requesting to join
  
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TripParticipant = typeof tripParticipants.$inferSelect;
export type InsertTripParticipant = typeof tripParticipants.$inferInsert;

