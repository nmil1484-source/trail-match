import * as db from './server/db';

const shops = [
  {
    name: "Auto Medic",
    description: "Auto repair shop specializing in off-road vehicle maintenance and repairs. Trusted by the San Clemente off-road community.",
    address: "103 Rincon Ct",
    city: "San Clemente",
    state: "CA",
    zipCode: "92672",
    phone: "(949) 498-7323",
    email: "",
    website: "",
    categories: ["Mechanic", "General"],
    services: ["Vehicle Maintenance", "Off-Road Repairs", "General Mechanic"],
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    photos: [],
    ownerId: 1, // Will use admin/first user
  },
  {
    name: "Full Tilt Off Road Equipment",
    description: "Service shop specializing in lifted trucks, as well as Jeep repairs and off-road vehicles. Expert suspension work and custom builds.",
    address: "1027 Calle Trepadora #1",
    city: "San Clemente",
    state: "CA",
    zipCode: "92673",
    phone: "(949) 366-6847",
    email: "",
    website: "https://fulltiltoffroad.com",
    categories: ["Mechanic", "Suspension", "Parts"],
    services: ["Lifted Trucks", "Jeep Repairs", "Suspension", "Off-Road Builds"],
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    photos: [],
    ownerId: 1,
  },
  {
    name: "Bajarex Motorsports",
    description: "Orange county's hidden gem for off-road vehicle builds, suspension, and performance upgrades. Specializing in high-performance off-road setups.",
    address: "1418 N Batavia St",
    city: "Orange",
    state: "CA",
    zipCode: "92867",
    phone: "(714) 280-5008",
    email: "",
    website: "",
    categories: ["Mechanic", "Suspension", "Fabrication"],
    services: ["Suspension Upgrades", "Performance Builds", "Custom Fabrication", "Off-Road Prep"],
    hours: "Mon-Fri: 7:00 AM - 5:00 PM",
    photos: [],
    ownerId: 1,
  },
  {
    name: "Sibi Built LLC",
    description: "Repair shop specializing in Toyota trucks and SUVs including lifted vehicles. Expert Toyota off-road builds and maintenance.",
    address: "1001 S Melrose St Unit C & D",
    city: "Placentia",
    state: "CA",
    zipCode: "92870",
    phone: "(714) 390-3399",
    email: "",
    website: "https://sibibuiltoffroad.com",
    categories: ["Mechanic", "Parts", "Suspension"],
    services: ["Toyota Specialist", "Lifted Vehicles", "Suspension", "Parts & Accessories"],
    hours: "Mon-Fri: 7:00 AM - 5:00 PM",
    photos: [],
    ownerId: 1,
  }
];

async function addShops() {
  console.log("🏪 Adding shops to database...\n");
  
  for (const shop of shops) {
    try {
      const shopId = await db.createShop(shop);
      console.log(`✅ Added: ${shop.name} (ID: ${shopId})`);
    } catch (error: any) {
      console.log(`⚠️  Error adding ${shop.name}: ${error.message}`);
    }
  }
  
  console.log("\n✨ Done!");
}

addShops()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
