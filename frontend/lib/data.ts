export type Waypoint = {
  city: string;
  lat: number;
  lng: number;
  detail?: string;
};

export type Review = {
  id: string;
  author: string;
  avatar: string; // initials
  rating: number;
  date: string;
  text: string;
  tags: string[];
};

export type DriverProfile = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  bio: string;
  joined: string;
  car: string;
  carYear: number;
  carColor: string;
  carBgColor: string; // CSS gradient for car photo placeholder
  rating: number;
  trips: number;
  fiveStarPct: number;
  reviews: Review[];
};

export type Ride = {
  id: string;
  driverId: string;
  driver: { name: string; rating: number; trips: number };
  waypoints: Waypoint[];
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;      // price per segment (from first to last waypoint)
  seats: number;
  car: string;
  carYear: number;
  carColor: string;
};

export const DRIVER_PROFILES: DriverProfile[] = [
  {
    id: "d1",
    name: "John D.",
    initials: "JD",
    avatarColor: "#2563EB",
    bio: "Professional driver with 5+ years experience. I keep my car clean and always arrive on time. Love meeting new people on the road!",
    joined: "March 2021",
    car: "Toyota Camry",
    carYear: 2021,
    carColor: "Silver",
    carBgColor: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
    rating: 4.8,
    trips: 47,
    fiveStarPct: 89,
    reviews: [
      { id: "r1", author: "Aytac S.", avatar: "AS", rating: 5, date: "Jul 2026", text: "Amazing driver! Super clean car, arrived on time, very friendly. Will definitely book again.", tags: ["Clean car", "On time", "Friendly"] },
      { id: "r2", author: "Kamran B.", avatar: "KB", rating: 5, date: "Jun 2026", text: "Smooth ride from Baku to Ganja. Car smelled great and John was very polite.", tags: ["Smooth ride", "Great driver"] },
      { id: "r3", author: "Sevinc A.", avatar: "SA", rating: 4, date: "Jun 2026", text: "Good trip overall. A bit late at pickup but the drive itself was comfortable.", tags: ["Safe driving"] },
      { id: "r4", author: "Rashad M.", avatar: "RM", rating: 5, date: "May 2026", text: "Best ride I've had on RideLink. Will always choose John!", tags: ["Great driver", "Would ride again"] },
    ],
  },
  {
    id: "d2",
    name: "Sara M.",
    initials: "SM",
    avatarColor: "#7C3AED",
    bio: "I drive between Baku and Ganja regularly for work. Always happy to share the ride and make the journey fun with good music!",
    joined: "January 2022",
    car: "BMW 3 Series",
    carYear: 2020,
    carColor: "Black",
    carBgColor: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
    rating: 4.5,
    trips: 23,
    fiveStarPct: 78,
    reviews: [
      { id: "r5", author: "Nihal T.", avatar: "NT", rating: 5, date: "Jul 2026", text: "Great vibes! Sara had the best playlist and drove super safely.", tags: ["Good music", "Safe driving"] },
      { id: "r6", author: "Elvin H.", avatar: "EH", rating: 4, date: "Jun 2026", text: "Nice BMW, comfortable seats. Would travel again.", tags: ["Smooth ride", "Clean car"] },
      { id: "r7", author: "Gunel F.", avatar: "GF", rating: 5, date: "May 2026", text: "Sara was really friendly and made the long trip feel short!", tags: ["Friendly", "Would ride again"] },
    ],
  },
  {
    id: "d3",
    name: "Ali K.",
    initials: "AK",
    avatarColor: "#059669",
    bio: "Experienced long-distance driver. I do the Baku–Sheki route every week. My Mercedes is always spotless — I take pride in passenger comfort.",
    joined: "September 2020",
    car: "Mercedes C-Class",
    carYear: 2022,
    carColor: "White",
    carBgColor: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
    rating: 4.9,
    trips: 112,
    fiveStarPct: 95,
    reviews: [
      { id: "r8", author: "Lala A.", avatar: "LA", rating: 5, date: "Jul 2026", text: "Ali is the gold standard. Immaculate car, zero drama, arrived early.", tags: ["Clean car", "On time", "Great driver"] },
      { id: "r9", author: "Tural N.", avatar: "TN", rating: 5, date: "Jul 2026", text: "112 trips and counting — no wonder. Absolute pro.", tags: ["Safe driving", "Would ride again"] },
      { id: "r10", author: "Mirvari C.", avatar: "MC", rating: 5, date: "Jun 2026", text: "The Mercedes ride is something else. Smooth, quiet, perfect.", tags: ["Smooth ride", "Great driver"] },
      { id: "r11", author: "Fuad O.", avatar: "FO", rating: 4, date: "Jun 2026", text: "Solid trip. Minor detour but Ali kept us informed the whole time.", tags: ["Friendly", "Safe driving"] },
    ],
  },
  {
    id: "d4",
    name: "Leyla N.",
    initials: "LN",
    avatarColor: "#DB2777",
    bio: "I commute Baku–Sumqayit daily. Sharing the ride saves us all money and reduces traffic! Always on schedule.",
    joined: "June 2022",
    car: "Hyundai Sonata",
    carYear: 2019,
    carColor: "Blue",
    carBgColor: "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)",
    rating: 4.7,
    trips: 61,
    fiveStarPct: 85,
    reviews: [
      { id: "r12", author: "Shafag I.", avatar: "SI", rating: 5, date: "Jul 2026", text: "Leyla is so kind! Made me feel super comfortable for my first RideLink trip.", tags: ["Friendly", "Clean car"] },
      { id: "r13", author: "Babek R.", avatar: "BR", rating: 4, date: "Jun 2026", text: "Fast and reliable. Great for the morning commute.", tags: ["On time", "Safe driving"] },
    ],
  },
  {
    id: "d5",
    name: "Murad T.",
    initials: "MT",
    avatarColor: "#D97706",
    bio: "Tech worker, part-time driver. I keep my Kia in top shape. Quiet ride — I respect passengers who need to work during the trip.",
    joined: "April 2023",
    car: "Kia Optima",
    carYear: 2020,
    carColor: "Gray",
    carBgColor: "linear-gradient(135deg, #6b7280 0%, #d1d5db 100%)",
    rating: 4.6,
    trips: 38,
    fiveStarPct: 81,
    reviews: [
      { id: "r14", author: "Orkhan V.", avatar: "OV", rating: 5, date: "Jul 2026", text: "Quiet, smooth, professional. Got a lot of work done during the ride!", tags: ["Smooth ride", "Great driver"] },
      { id: "r15", author: "Xanim B.", avatar: "XB", rating: 4, date: "May 2026", text: "Nice car and pleasant driver. Recommended.", tags: ["Clean car", "Friendly"] },
    ],
  },
  {
    id: "d6",
    name: "Nigar R.",
    initials: "NR",
    avatarColor: "#0891B2",
    bio: "I make the Baku–Lankaran trip weekly to visit family. Big Land Cruiser = lots of space and comfort for everyone. Join me!",
    joined: "November 2020",
    car: "Toyota Land Cruiser",
    carYear: 2023,
    carColor: "Black",
    carBgColor: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
    rating: 4.9,
    trips: 88,
    fiveStarPct: 93,
    reviews: [
      { id: "r16", author: "Samir Q.", avatar: "SQ", rating: 5, date: "Jul 2026", text: "Land Cruiser is incredibly comfortable for a 4-hour trip. Nigar is a star.", tags: ["Clean car", "Great driver", "Smooth ride"] },
      { id: "r17", author: "Aysel M.", avatar: "AM", rating: 5, date: "Jun 2026", text: "Best long-distance driver on the platform. Always 5 stars.", tags: ["On time", "Safe driving", "Would ride again"] },
      { id: "r18", author: "Javid K.", avatar: "JK", rating: 4, date: "Jun 2026", text: "Great trip, very spacious car. Minor stop added but no problem.", tags: ["Friendly", "Clean car"] },
    ],
  },
];

// city registry with coordinates
export const CITIES: Record<string, { lat: number; lng: number }> = {
  Baku:      { lat: 40.4093, lng: 49.8671 },
  Sumqayit:  { lat: 40.5897, lng: 49.6686 },
  Ganja:     { lat: 40.6828, lng: 46.3606 },
  Sheki:     { lat: 41.1946, lng: 47.1703 },
  Lankaran:  { lat: 38.7539, lng: 48.8522 },
  Mingachevir: { lat: 40.7706, lng: 47.0503 },
};

export const RIDES: Ride[] = [
  {
    id: "1",
    driverId: "d1",
    driver: { name: "John D.", rating: 4.8, trips: 47 },
    waypoints: [
      { city: "Baku",  lat: 40.4093, lng: 49.8671, detail: "28 May Metro Station" },
      { city: "Sumqayit", lat: 40.5897, lng: 49.6686, detail: "Central Market" },
      { city: "Ganja", lat: 40.6828, lng: 46.3606, detail: "Central Bus Station" },
    ],
    date: "2026-07-15",
    departureTime: "09:00",
    arrivalTime: "12:30",
    price: 5,
    seats: 2,
    car: "Toyota Camry",
    carYear: 2021,
    carColor: "Silver",
  },
  {
    id: "2",
    driverId: "d2",
    driver: { name: "Sara M.", rating: 4.5, trips: 23 },
    waypoints: [
      { city: "Baku",  lat: 40.4093, lng: 49.8671, detail: "Koroghlu Metro Station" },
      { city: "Ganja", lat: 40.6828, lng: 46.3606, detail: "Central Bus Station" },
    ],
    date: "2026-07-15",
    departureTime: "11:00",
    arrivalTime: "14:30",
    price: 4,
    seats: 1,
    car: "BMW 3 Series",
    carYear: 2020,
    carColor: "Black",
  },
  {
    id: "3",
    driverId: "d3",
    driver: { name: "Ali K.", rating: 4.9, trips: 112 },
    // Baku → Ganja → Mingachevir → Sheki — so Baku→Ganja search catches this too
    waypoints: [
      { city: "Baku",  lat: 40.4093, lng: 49.8671, detail: "Hazi Aslanov Metro" },
      { city: "Ganja", lat: 40.6828, lng: 46.3606, detail: "Ganja City Center" },
      { city: "Mingachevir", lat: 40.7706, lng: 47.0503, detail: "Mingachevir Bridge" },
      { city: "Sheki", lat: 41.1946, lng: 47.1703, detail: "Sheki City Center" },
    ],
    date: "2026-07-15",
    departureTime: "14:00",
    arrivalTime: "19:30",
    price: 6,
    seats: 3,
    car: "Mercedes C-Class",
    carYear: 2022,
    carColor: "White",
  },
  {
    id: "4",
    driverId: "d4",
    driver: { name: "Leyla N.", rating: 4.7, trips: 61 },
    waypoints: [
      { city: "Baku",     lat: 40.4093, lng: 49.8671, detail: "Avtovagzal" },
      { city: "Sumqayit", lat: 40.5897, lng: 49.6686, detail: "Sumqayit Central" },
    ],
    date: "2026-07-15",
    departureTime: "08:30",
    arrivalTime: "09:15",
    price: 2,
    seats: 2,
    car: "Hyundai Sonata",
    carYear: 2019,
    carColor: "Blue",
  },
  {
    id: "5",
    driverId: "d5",
    driver: { name: "Murad T.", rating: 4.6, trips: 38 },
    waypoints: [
      { city: "Baku",     lat: 40.4093, lng: 49.8671, detail: "28 May Metro Station" },
      { city: "Sumqayit", lat: 40.5897, lng: 49.6686, detail: "Sumqayit City" },
    ],
    date: "2026-07-15",
    departureTime: "10:00",
    arrivalTime: "10:45",
    price: 3,
    seats: 3,
    car: "Kia Optima",
    carYear: 2020,
    carColor: "Gray",
  },
  {
    id: "6",
    driverId: "d6",
    driver: { name: "Nigar R.", rating: 4.9, trips: 88 },
    // Baku → Lankaran long route
    waypoints: [
      { city: "Baku",     lat: 40.4093, lng: 49.8671, detail: "Hazi Aslanov Metro" },
      { city: "Lankaran", lat: 38.7539, lng: 48.8522, detail: "Lankaran Bus Terminal" },
    ],
    date: "2026-07-15",
    departureTime: "07:00",
    arrivalTime: "11:30",
    price: 7,
    seats: 2,
    car: "Toyota Land Cruiser",
    carYear: 2023,
    carColor: "Black",
  },
];

// Returns true if ride serves the from→to segment (waypoint order matters)
export function rideServesRoute(ride: Ride, from: string, to: string): boolean {
  const cities = ride.waypoints.map(w => w.city.toLowerCase());
  const fi = cities.indexOf(from.toLowerCase());
  const ti = cities.indexOf(to.toLowerCase());
  return fi !== -1 && ti !== -1 && fi < ti;
}

// Price for a sub-segment (proportional to waypoint distance)
export function segmentPrice(ride: Ride, from: string, to: string): number {
  const cities = ride.waypoints.map(w => w.city.toLowerCase());
  const fi = cities.indexOf(from.toLowerCase());
  const ti = cities.indexOf(to.toLowerCase());
  if (fi === -1 || ti === -1) return ride.price;
  const totalLegs = ride.waypoints.length - 1;
  const segLegs = ti - fi;
  return Math.round((ride.price * segLegs) / totalLegs);
}
