import Booking, { IBooking } from '../models/booking.model';
import Ride from '../models/ride.model';
import mongoose from 'mongoose';

function segmentPrice(ride: any, from: string, to: string): number {
  const cities = ride.waypoints.map((w: any) => w.city.toLowerCase());
  const fi = cities.indexOf(from.toLowerCase());
  const ti = cities.indexOf(to.toLowerCase());
  if (fi === -1 || ti === -1) return ride.price;
  const totalLegs = ride.waypoints.length - 1;
  return Math.round((ride.price * (ti - fi)) / totalLegs);
}

export async function createBooking(data: {
  rideId: string;
  passengerName: string;
  passengerPhone: string;
  fromCity: string;
  toCity: string;
  date: string;
  seats: number;
}) {
  const ride = await Ride.findById(data.rideId);
  if (!ride) throw new Error('Ride not found');
  if (ride.seats < data.seats) throw new Error('Not enough seats');

  const pricePerSeat = segmentPrice(ride, data.fromCity, data.toCity);
  const totalPrice = pricePerSeat * data.seats;

  // decrement available seats
  ride.seats -= data.seats;
  await ride.save();

  const booking = new Booking({ ...data, rideId: new mongoose.Types.ObjectId(data.rideId), totalPrice });
  await booking.save();
  return booking;
}

export async function getBookingById(id: string) {
  return Booking.findById(id).populate('rideId').lean();
}

export async function getAllBookings() {
  return Booking.find().sort({ createdAt: -1 }).lean();
}
