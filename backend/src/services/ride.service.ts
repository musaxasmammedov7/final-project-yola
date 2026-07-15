import Ride, { IRide } from '../models/ride.model';
import redis from '../config/redis';

const CACHE_TTL = 60; // seconds

function rideServesRoute(ride: IRide, from: string, to: string): boolean {
  const cities = ride.waypoints.map(w => w.city.toLowerCase());
  const fi = cities.indexOf(from.toLowerCase());
  const ti = cities.indexOf(to.toLowerCase());
  return fi !== -1 && ti !== -1 && fi < ti;
}

function segmentPrice(ride: IRide, from: string, to: string): number {
  const cities = ride.waypoints.map(w => w.city.toLowerCase());
  const fi = cities.indexOf(from.toLowerCase());
  const ti = cities.indexOf(to.toLowerCase());
  if (fi === -1 || ti === -1) return ride.price;
  const totalLegs = ride.waypoints.length - 1;
  const segLegs = ti - fi;
  return Math.round((ride.price * segLegs) / totalLegs);
}

export async function searchRides(from: string, to: string, date: string, seats: number) {
  const cacheKey = `rides:${from}:${to}:${date}:${seats}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const allRides = await Ride.find({ date }).lean();
  const results = (allRides as unknown as IRide[])
    .filter(r => rideServesRoute(r, from, to) && r.seats >= seats)
    .map(r => ({ ...r, segmentPrice: segmentPrice(r, from, to) }));

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results));
  return results;
}

export async function getRideById(id: string) {
  const cached = await redis.get(`ride:${id}`);
  if (cached) return JSON.parse(cached);
  const ride = await Ride.findById(id).lean();
  if (ride) await redis.setex(`ride:${id}`, CACHE_TTL, JSON.stringify(ride));
  return ride;
}

export async function createRide(data: Partial<IRide>) {
  const ride = new Ride(data);
  await ride.save();
  return ride;
}

export async function getAllRides() {
  const cached = await redis.get('rides:all');
  if (cached) return JSON.parse(cached);
  const rides = await Ride.find().sort({ createdAt: -1 }).lean();
  await redis.setex('rides:all', CACHE_TTL, JSON.stringify(rides));
  return rides;
}
