import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"),
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
  
  // Communication preferences
  communicationMethods: json("communicationMethods"),
  phoneNumber: varchar("phoneNumber", { length: 50 }),
  whatsappNumber: varchar("whatsappNumber", { length: 50 }),
  facebookHandle: varchar("facebookHandle", { length: 255 }),
  instagramHandle: varchar("instagramHandle", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["open", "full", "completed", "cancelled"]).default("open").notNull(),
  
  // Privacy settings
  isPrivate: boolean("isPrivate").default(false).notNull(),
  shareToken: varchar("shareToken", { length: 64 }),
  
  // Premium listing tiers
  premiumTier: mysqlEnum("premiumTier", ["free", "featured", "premium"]).default("free").notNull(),
  premiumExpiresAt: timestamp("premiumExpiresAt"),
  
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
  status: mysqlEnum("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TripParticipant = typeof tripParticipants.$inferSelect;
export type InsertTripParticipant = typeof tripParticipants.$inferInsert;

/**
 * Shops table - local shops that work on off-road vehicles
 */
export const shops = mysqlTable("shops", {
  id: int("id").autoincrement().primaryKey(),
  addedBy: int("addedBy").notNull(), // User who added the shop
  
  // Shop details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categories: json("categories").notNull(), // Array of categories: ["mechanic", "fabrication", "parts", "tires", "suspension", "general", "other"]
  otherDescription: text("otherDescription"), // Custom description when "other" category is selected
  
  // Location
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  
  // Contact
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  
  // Stats
  averageRating: int("averageRating").default(0), // 0-50 (stored as 0-5.0 * 10)
  totalReviews: int("totalReviews").default(0),
  
  // Photos
  photos: json("photos"), // Array of photo URLs
  
  // Verification and Premium Features
  isVerified: boolean("isVerified").default(false), // Admin-approved verification badge
  verifiedAt: timestamp("verifiedAt"), // When shop was verified
  verifiedBy: int("verifiedBy"), // Admin user ID who verified
  
  premiumTier: mysqlEnum("premiumTier", ["none", "featured", "premium"]).default("none"),
  premiumExpiresAt: timestamp("premiumExpiresAt"), // When premium subscription expires
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shop = typeof shops.$inferSelect;
export type InsertShop = typeof shops.$inferInsert;

/**
 * Shop reviews table
 */
export const shopReviews = mysqlTable("shopReviews", {
  id: int("id").autoincrement().primaryKey(),
  shopId: int("shopId").notNull(),
  userId: int("userId").notNull(),
  
  rating: int("rating").notNull(), // 1-5 stars
  reviewText: text("reviewText"),
  
  // Service details
  serviceType: varchar("serviceType", { length: 100 }), // What service they got
  wouldRecommend: boolean("wouldRecommend").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShopReview = typeof shopReviews.$inferSelect;
export type InsertShopReview = typeof shopReviews.$inferInsert;

/**
 * Password reset tokens table
 */
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Trip reviews table - reviews for completed trips
 */
export const tripReviews = mysqlTable("tripReviews", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(), // User who wrote the review
  organizerId: int("organizerId").notNull(), // Trip organizer being reviewed
  
  rating: int("rating").notNull(), // 1-5 stars
  reviewText: text("reviewText"),
  
  // Review categories
  organizationRating: int("organizationRating"), // 1-5 for trip organization
  communicationRating: int("communicationRating"), // 1-5 for communication
  wouldJoinAgain: boolean("wouldJoinAgain").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TripReview = typeof tripReviews.$inferSelect;
export type InsertTripReview = typeof tripReviews.$inferInsert;

/**
 * Conversations table - represents a conversation between two users
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  user1Id: int("user1Id"), // First participant (null for group chats)
  user2Id: int("user2Id"), // Second participant (null for group chats)
  tripId: int("tripId"), // Trip this conversation is about (null for direct messages)
  isGroup: boolean("isGroup").default(false).notNull(), // True for trip group chats
  title: varchar("title", { length: 255 }), // Optional title for group chats
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table - stores individual messages within conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
