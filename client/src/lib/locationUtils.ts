// Simple location matching utility for better search
// Maps common state names and regions to help find trips

const STATE_CITIES: Record<string, string[]> = {
  california: ['mojave', 'death valley', 'anza-borrego', 'big bear', 'mammoth', 'bishop', 'barstow', 'ridgecrest', 'lone pine'],
  nevada: ['las vegas', 'reno', 'carson city', 'valley of fire', 'lake tahoe'],
  utah: ['moab', 'salt lake', 'st george', 'kanab', 'price', 'green river', 'blanding'],
  arizona: ['sedona', 'flagstaff', 'phoenix', 'tucson', 'yuma', 'lake havasu', 'kingman'],
  colorado: ['denver', 'colorado springs', 'durango', 'telluride', 'ouray', 'silverton', 'moab'],
  montana: ['drummond', 'missoula', 'bozeman', 'butte', 'helena', 'great falls'],
  wyoming: ['jackson', 'cody', 'laramie', 'cheyenne', 'rock springs'],
  oregon: ['bend', 'portland', 'eugene', 'crater lake', 'hood river'],
  washington: ['seattle', 'spokane', 'yakima', 'wenatchee', 'ellensburg'],
  idaho: ['boise', 'sun valley', 'stanley', 'ketchum', 'twin falls'],
  new_mexico: ['albuquerque', 'santa fe', 'taos', 'farmington', 'silver city'],
  texas: ['austin', 'big bend', 'el paso', 'lubbock', 'amarillo'],
};

// Normalize location string for matching
function normalizeLocation(location: string): string {
  return location.toLowerCase().trim().replace(/[^a-z\s]/g, '');
}

// Check if a search term matches a location
export function matchesLocation(tripLocation: string, searchTerm: string): boolean {
  const normalizedTrip = normalizeLocation(tripLocation);
  const normalizedSearch = normalizeLocation(searchTerm);
  
  // Direct substring match (existing behavior)
  if (normalizedTrip.includes(normalizedSearch)) {
    return true;
  }
  
  // Check if search term is a state name
  const stateCities = STATE_CITIES[normalizedSearch];
  if (stateCities) {
    // Check if trip location matches any city in that state
    return stateCities.some(city => normalizedTrip.includes(city));
  }
  
  // Check if search term is a state abbreviation
  const stateAbbreviations: Record<string, string> = {
    ca: 'california',
    nv: 'nevada',
    ut: 'utah',
    az: 'arizona',
    co: 'colorado',
    mt: 'montana',
    wy: 'wyoming',
    or: 'oregon',
    wa: 'washington',
    id: 'idaho',
    nm: 'new_mexico',
    tx: 'texas',
  };
  
  const fullStateName = stateAbbreviations[normalizedSearch];
  if (fullStateName) {
    const cities = STATE_CITIES[fullStateName];
    if (cities) {
      return cities.some(city => normalizedTrip.includes(city));
    }
  }
  
  return false;
}
