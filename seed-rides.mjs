#!/usr/bin/env node
// Seed MongoDB with initial rides via the backend API.
// Usage: node seed-rides.mjs [API_URL]
// Default API_URL: https://expensy-istio-ingress.swedencentral.cloudapp.azure.com

const API_URL = process.argv[2] ?? "https://expensy-istio-ingress.swedencentral.cloudapp.azure.com";

const RIDES = [
  {
    driverName: "John D.", driverRating: 4.8, driverTrips: 47,
    waypoints: [
      { city: "Baku",      lat: 40.4093, lng: 49.8671, detail: "28 May Metro Station" },
      { city: "Sumqayit", lat: 40.5897, lng: 49.6686, detail: "Central Market" },
      { city: "Ganja",    lat: 40.6828, lng: 46.3606, detail: "Central Bus Station" },
    ],
    date: "2026-07-16", departureTime: "09:00", arrivalTime: "12:30",
    price: 5, seats: 10, car: "Toyota Camry", carYear: 2021, carColor: "Silver",
    carPhoto: "/cars/camry-2021.jpg",
  },
  {
    driverName: "Sara M.", driverRating: 4.5, driverTrips: 23,
    waypoints: [
      { city: "Baku",  lat: 40.4093, lng: 49.8671, detail: "Koroghlu Metro Station" },
      { city: "Ganja", lat: 40.6828, lng: 46.3606, detail: "Central Bus Station" },
    ],
    date: "2026-07-16", departureTime: "11:00", arrivalTime: "14:30",
    price: 4, seats: 1, car: "BMW 3 Series", carYear: 2020, carColor: "Black",
  },
  {
    driverName: "Ali K.", driverRating: 4.9, driverTrips: 112,
    waypoints: [
      { city: "Baku",         lat: 40.4093, lng: 49.8671, detail: "Hazi Aslanov Metro" },
      { city: "Ganja",        lat: 40.6828, lng: 46.3606, detail: "Ganja City Center" },
      { city: "Mingachevir",  lat: 40.7706, lng: 47.0503, detail: "Mingachevir Bridge" },
      { city: "Sheki",        lat: 41.1946, lng: 47.1703, detail: "Sheki City Center" },
    ],
    date: "2026-07-16", departureTime: "14:00", arrivalTime: "19:30",
    price: 6, seats: 3, car: "Mercedes C-Class", carYear: 2022, carColor: "White",
  },
  {
    driverName: "Leyla N.", driverRating: 4.7, driverTrips: 61,
    waypoints: [
      { city: "Baku",     lat: 40.4093, lng: 49.8671, detail: "Avtovagzal" },
      { city: "Sumqayit", lat: 40.5897, lng: 49.6686, detail: "Sumqayit Central" },
    ],
    date: "2026-07-16", departureTime: "08:30", arrivalTime: "09:15",
    price: 2, seats: 2, car: "Hyundai Sonata", carYear: 2019, carColor: "Blue",
  },
  {
    driverName: "Murad T.", driverRating: 4.6, driverTrips: 38,
    waypoints: [
      { city: "Baku",     lat: 40.4093, lng: 49.8671, detail: "28 May Metro Station" },
      { city: "Sumqayit", lat: 40.5897, lng: 49.6686, detail: "Sumqayit City" },
    ],
    date: "2026-07-16", departureTime: "10:00", arrivalTime: "10:45",
    price: 3, seats: 3, car: "Kia Optima", carYear: 2020, carColor: "Gray",
  },
  {
    driverName: "Nigar R.", driverRating: 4.9, driverTrips: 88,
    waypoints: [
      { city: "Baku",     lat: 40.4093, lng: 49.8671, detail: "Hazi Aslanov Metro" },
      { city: "Lankaran", lat: 38.7539, lng: 48.8522, detail: "Lankaran Bus Terminal" },
    ],
    date: "2026-07-16", departureTime: "07:00", arrivalTime: "11:30",
    price: 7, seats: 2, car: "Toyota Land Cruiser", carYear: 2023, carColor: "Black",
  },
];

console.log(`Clearing existing rides…`);
try {
  const del = await fetch(`${API_URL}/api/rides`, { method: "DELETE" });
  console.log(del.ok ? "✓ Cleared\n" : `✗ Clear failed: ${del.status}\n`);
} catch (err) {
  console.error(`✗ Clear error: ${err.message}\n`);
}

console.log(`Seeding ${RIDES.length} rides to ${API_URL} …\n`);

for (const ride of RIDES) {
  try {
    const res = await fetch(`${API_URL}/api/rides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ride),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✓ ${ride.driverName} — ${ride.waypoints.map(w => w.city).join(" → ")} — id: ${data._id}`);
    } else {
      console.error(`✗ ${ride.driverName}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error(`✗ ${ride.driverName}: ${err.message}`);
  }
}

console.log("\nDone.");
