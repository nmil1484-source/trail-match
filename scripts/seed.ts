import { drizzle } from "drizzle-orm/mysql2";
import { trips, vehicles } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const sampleTrips = [
  {
    organizerId: 1,
    title: "Moab Rock Crawling Weekend",
    description: "Epic rock crawling adventure through Hell's Revenge and Poison Spider Mesa. This is an advanced trip for experienced wheelers with capable rigs.",
    location: "Moab, UT",
    state: "UT",
    startDate: new Date("2025-11-15"),
    endDate: new Date("2025-11-17"),
    difficulty: "advanced" as const,
    styles: ["rock_crawling"],
    maxParticipants: 6,
    currentParticipants: 3,
    minTireSize: "35\"",
    requiresWinch: true,
    requiresLockers: true,
    minBuildLevel: "moderate" as const,
    photos: ["/mockup_trip_card.png"],
    itinerary: "Day 1: Hell's Revenge trail\nDay 2: Poison Spider Mesa\nDay 3: Fins and Things",
    campingInfo: "Camping at Sand Flats Recreation Area",
    status: "open" as const,
  },
  {
    organizerId: 1,
    title: "Desert Expedition - Mojave",
    description: "Multi-day desert expedition through the Mojave Preserve. Mix of sand dunes, rocky trails, and scenic overlanding routes.",
    location: "Mojave National Preserve, CA",
    state: "CA",
    startDate: new Date("2025-10-10"),
    endDate: new Date("2025-10-14"),
    difficulty: "intermediate" as const,
    styles: ["desert", "overlanding"],
    maxParticipants: 8,
    currentParticipants: 4,
    minTireSize: "33\"",
    requiresWinch: false,
    requiresLockers: false,
    minBuildLevel: "mild" as const,
    photos: [],
    itinerary: "4-day expedition with camping each night",
    campingInfo: "Dispersed camping throughout the preserve",
    status: "open" as const,
  },
  {
    organizerId: 1,
    title: "Alpine Forest Trail - Colorado",
    description: "Beautiful alpine trail riding through the Rocky Mountains. Moderate difficulty with stunning mountain views and stream crossings.",
    location: "Silverton, CO",
    state: "CO",
    startDate: new Date("2025-05-05"),
    endDate: new Date("2025-05-09"),
    difficulty: "intermediate" as const,
    styles: ["trail_riding", "overlanding"],
    maxParticipants: 10,
    currentParticipants: 6,
    minTireSize: "32\"",
    requiresWinch: false,
    requiresLockers: false,
    minBuildLevel: "stock" as const,
    photos: [],
    itinerary: "Engineer Pass, Cinnamon Pass, and Black Bear Pass",
    campingInfo: "Mix of established campgrounds and dispersed camping",
    status: "open" as const,
  },
  {
    organizerId: 1,
    title: "Rugged Canyon Run - Arizona",
    description: "Technical canyon trails with challenging rock obstacles. Perfect for testing your rig's capabilities.",
    location: "Sedona, AZ",
    state: "AZ",
    startDate: new Date("2025-09-09"),
    endDate: new Date("2025-09-06"),
    difficulty: "advanced" as const,
    styles: ["rock_crawling"],
    maxParticipants: 6,
    currentParticipants: 2,
    minTireSize: "35\"",
    requiresWinch: true,
    requiresLockers: true,
    minBuildLevel: "moderate" as const,
    photos: [],
    itinerary: "Broken Arrow, Diamondback Gulch, and Schnebly Hill Road",
    campingInfo: "Hotel accommodations in Sedona",
    status: "open" as const,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    console.log("Inserting sample trips...");
    for (const trip of sampleTrips) {
      await db.insert(trips).values(trip);
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();

