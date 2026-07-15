import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  rideId: mongoose.Types.ObjectId;
  passengerName: string;
  passengerPhone: string;
  fromCity: string;
  toCity: string;
  date: string;
  seats: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  rideId:         { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
  passengerName:  { type: String, required: true },
  passengerPhone: { type: String, required: true },
  fromCity:       { type: String, required: true },
  toCity:         { type: String, required: true },
  date:           { type: String, required: true },
  seats:          { type: Number, required: true, min: 1 },
  totalPrice:     { type: Number, required: true },
  status:         { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  createdAt:      { type: Date, default: Date.now },
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
