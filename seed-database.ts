import * as db from './server/db';
import bcrypt from 'bcryptjs';

const FAKE_USERS = [
  { name: "Jake Morrison", email: "jake.morrison@example.com", location: "Moab, UT", experienceLevel: "advanced" },
  { name: "Sarah Chen", email: "sarah.chen@example.com", location: "Phoenix, AZ", experienceLevel: "intermediate" },
  { name: "Mike Rodriguez", email: "mike.rodriguez@example.com", location: "San Diego, CA", experienceLevel: "expert" },
  { name: "Emily Thompson", email: "emily.thompson@example.com", location: "Denver, CO", experienceLevel: "intermediate" },
  { name: "Chris Anderson", email: "chris.anderson@example.com", location: "Las Vegas, NV", experienceLevel: "advanced" },
  { name: "Jessica Martinez", email: "jessica.martinez@example.com", location: "Flagstaff, AZ", experienceLevel: "beginner" },
  { name: "Ryan Cooper", email: "ryan.cooper@example.com", location: "Salt Lake City, UT", experienceLevel: "intermediate" },
  { name: "Amanda Wilson", email: "amanda.wilson@example.com", location: "Tucson, AZ", experienceLevel: "advanced" },
  { name: "David Kim", email: "david.kim@example.com", location: "Baja California, Mexico", experienceLevel: "expert" },
  { name: "Lauren Brooks", email: "lauren.brooks@example.com", location: "Reno, NV", experienceLevel: "intermediate" },
];

const FAKE_TRIPS = [
  {
    title: "Moab Weekend - Hell's Revenge",
    description: "Classic Moab slickrock trail. Perfect for intermediate to advanced rigs. We'll meet at the trailhead Saturday morning.",
    location: "Moab, UT",
    state: "UT",
    difficulty: "advanced",
    styles: ["rock_crawling", "jeeping"],
    maxParticipants: 8,
    minTireSize: "35\"",
    requiresWinch: false,
    requiresLockers: true,
    vehicleRequirement: "4x4_modded",
  },
  {
    title: "Anza-Borrego Desert Overland",
    description: "3-day overland trip through Anza-Borrego Desert State Park. Camping under the stars, exploring remote trails.",
    location: "Borrego Springs, CA",
    state: "CA",
    difficulty: "intermediate",
    styles: ["overland", "desert"],
    maxParticipants: 6,
    requiresWinch: false,
    requiresLockers: false,
    vehicleRequirement: "4x4_stock",
  },
  {
    title: "Baja Pre-Runner Adventure",
    description: "Fast-paced desert run through Baja. Long travel rigs preferred. High-speed desert running.",
    location: "San Felipe, Baja California",
    state: "Baja",
    difficulty: "expert",
    styles: ["pre_running", "long_travel_only"],
    maxParticipants: 4,
    minTireSize: "37\"",
    requiresWinch: false,
    requiresLockers: false,
    vehicleRequirement: "long_travel_fast",
  },
  {
    title: "Sedona Red Rock Crawl",
    description: "Beginner-friendly rock crawling in beautiful Sedona. Great for stock rigs and newcomers to the sport.",
    location: "Sedona, AZ",
    state: "AZ",
    difficulty: "beginner",
    styles: ["rock_crawling", "jeeping"],
    maxParticipants: 10,
    requiresWinch: false,
    requiresLockers: false,
    vehicleRequirement: "4x4_stock",
  },
  {
    title: "Colorado Alpine Loop",
    description: "High-altitude adventure through the San Juan Mountains. Stunning views, moderate trails.",
    location: "Ouray, CO",
    state: "CO",
    difficulty: "intermediate",
    styles: ["overland", "jeeping"],
    maxParticipants: 6,
    minTireSize: "33\"",
    requiresWinch: true,
    requiresLockers: false,
    vehicleRequirement: "4x4_stock",
  },
  {
    title: "Glamis Dunes Raptor Run",
    description: "Raptor-only dunes run. Fast-paced, high-flying fun in the Imperial Sand Dunes.",
    location: "Glamis, CA",
    state: "CA",
    difficulty: "advanced",
    styles: ["raptor", "desert"],
    maxParticipants: 8,
    requiresWinch: false,
    requiresLockers: false,
    vehicleRequirement: "raptor",
  },
  {
    title: "Johnson Valley Desert Exploration",
    description: "Open desert exploration near King of the Hammers venue. Mix of trails for all skill levels.",
    location: "Johnson Valley, CA",
    state: "CA",
    difficulty: "intermediate",
    styles: ["desert", "rock_crawling"],
    maxParticipants: 12,
    requiresWinch: false,
    requiresLockers: false,
    vehicleRequirement: "4x4_stock",
  },
  {
    title: "Rubicon Trail Expedition",
    description: "The legendary Rubicon Trail. 5-day expedition for heavily modified rigs only. Winch and lockers required.",
    location: "Georgetown, CA",
    state: "CA",
    difficulty: "expert",
    styles: ["rock_crawling", "overland"],
    maxParticipants: 6,
    minTireSize: "37\"",
    requiresWinch: true,
    requiresLockers: true,
    vehicleRequirement: "4x4_modded",
  },
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");
  
  const password = "TrailMatch2024!";
  const passwordHash = await bcrypt.hash(password, 10);
  
  console.log("Creating fake users...");
  const userIds: number[] = [];
  
  for (const user of FAKE_USERS) {
    try {
      const userId = await db.createUserWithPassword({
        email: user.email,
        passwordHash,
        name: user.name,
      });
      
      // Update profile
      await db.updateUserProfile(userId, {
        location: user.location,
        experienceLevel: user.experienceLevel as any,
      });
      
      userIds.push(userId);
      console.log(`✅ Created user: ${user.name}`);
    } catch (error) {
      console.log(`⚠️  User ${user.email} might already exist, skipping...`);
    }
  }
  
  console.log(`\n📊 Created ${userIds.length} users`);
  
  console.log("\nCreating fake trips...");
  let tripCount = 0;
  
  for (let i = 0; i < FAKE_TRIPS.length; i++) {
    const trip = FAKE_TRIPS[i];
    const organizerId = userIds[i % userIds.length]; // Distribute trips among users
    
    // Create dates in the future
    const daysFromNow = 7 + (i * 5); // Spread trips over next few weeks
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysFromNow);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (trip.title.includes("day") ? 3 : 1));
    
    try {
      await db.createTrip({
        ...trip,
        organizerId,
        startDate,
        endDate,
        currentParticipants: Math.floor(Math.random() * 3) + 1, // 1-3 participants
        photos: [],
      });
      
      tripCount++;
      console.log(`✅ Created trip: ${trip.title}`);
    } catch (error) {
      console.log(`⚠️  Error creating trip: ${trip.title}`, error);
    }
  }
  
  console.log(`\n📊 Created ${tripCount} trips`);
  console.log("\n✨ Database seeding complete!");
  console.log(`\n🔑 All fake users have password: ${password}`);
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
