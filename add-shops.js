// Simple Node.js script to add shops via the API
const shops = [
  {
    name: "Auto Medic",
    description: "Auto repair shop specializing in off-road vehicle maintenance and repairs.",
    address: "103 Rincon Ct, San Clemente, CA 92672",
    city: "San Clemente",
    state: "CA",
    phone: "(949) 498-7323",
    website: "",
    categories: ["Mechanic", "General"],
    rating: 5.0
  },
  {
    name: "Full Tilt Off Road Equipment",
    description: "Service shop specializing in lifted trucks, as well as Jeep repairs and off-road vehicles.",
    address: "1027 Calle Trepadora #1, San Clemente, CA 92673",
    city: "San Clemente", 
    state: "CA",
    phone: "(949) 366-6847",
    website: "https://fulltiltoffroad.com",
    categories: ["Mechanic", "Suspension", "Parts"],
    rating: 4.6
  },
  {
    name: "Bajarex Motorsports",
    description: "Orange county's hidden gem for off-road vehicle builds, suspension, and performance upgrades.",
    address: "1418 N Batavia St, Orange, CA 92867",
    city: "Orange",
    state: "CA", 
    phone: "(714) 280-5008",
    website: "",
    categories: ["Mechanic", "Suspension", "Fabrication"],
    rating: 5.0
  },
  {
    name: "Sibi Built LLC",
    description: "Repair shop specializing in Toyota trucks and SUVs including lifted vehicles.",
    address: "1001 S Melrose St Unit C & D, Placentia, CA 92870",
    city: "Placentia",
    state: "CA",
    phone: "(714) 390-3399",
    website: "https://sibibuiltoffroad.com",
    categories: ["Mechanic", "Parts", "Suspension"],
    rating: 4.9
  }
];

console.log("Shops to add:");
console.log(JSON.stringify(shops, null, 2));
console.log("\n\nYou can add these shops manually through the TrailMatch website at /shops");
console.log("Or we can create a proper database seeding script.");
