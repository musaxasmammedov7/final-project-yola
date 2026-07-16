const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ApiRide = {
  _id: string;
  driverName: string;
  driverRating: number;
  driverTrips: number;
  waypoints: { city: string; lat: number; lng: number; detail?: string }[];
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seats: number;
  car: string;
  carYear: number;
  carColor: string;
  carPhoto?: string;
  segmentPrice?: number;
};

export type ApiBooking = {
  _id: string;
  rideId: string;
  passengerName: string;
  passengerPhone: string;
  fromCity: string;
  toCity: string;
  date: string;
  seats: number;
  totalPrice: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
};

export function calcSegmentPrice(ride: ApiRide, from: string, to: string): number {
  const cities = ride.waypoints.map(w => w.city.toLowerCase());
  const fi = cities.indexOf(from.toLowerCase());
  const ti = cities.indexOf(to.toLowerCase());
  if (fi === -1 || ti === -1) return ride.price;
  const totalLegs = ride.waypoints.length - 1;
  return Math.round((ride.price * (ti - fi)) / totalLegs);
}

export async function searchRides(from: string, to: string, date: string, seats: number): Promise<ApiRide[]> {
  const q = new URLSearchParams({ from, to, date, seats: String(seats) });
  const res = await fetch(`${API_URL}/api/rides?${q}`);
  if (!res.ok) throw new Error("Failed to fetch rides");
  return res.json();
}

export async function fetchRide(id: string): Promise<ApiRide> {
  const res = await fetch(`${API_URL}/api/rides/${id}`);
  if (!res.ok) throw new Error("Ride not found");
  return res.json();
}

export async function postBooking(data: {
  rideId: string;
  passengerName: string;
  passengerPhone: string;
  fromCity: string;
  toCity: string;
  date: string;
  seats: number;
}): Promise<ApiBooking> {
  const res = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? "Failed to create booking");
  }
  return res.json();
}

export async function fetchBooking(id: string): Promise<ApiBooking> {
  const res = await fetch(`${API_URL}/api/bookings/${id}`);
  if (!res.ok) throw new Error("Booking not found");
  const b = await res.json();
  // rideId is populated (full Ride doc) — extract its _id string
  if (b.rideId && typeof b.rideId !== "string") b.rideId = b.rideId._id ?? b.rideId.$oid ?? String(b.rideId);
  return b;
}

// localStorage helpers
const LS_KEY = "yola_booking_ids";

export function storedBookingIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
  catch { return []; }
}

export function saveBookingId(id: string) {
  const ids = storedBookingIds();
  localStorage.setItem(LS_KEY, JSON.stringify([id, ...ids]));
}
