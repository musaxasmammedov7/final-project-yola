import mongoose, { Document, Schema } from 'mongoose';

export interface IWaypoint {
  city: string;
  lat: number;
  lng: number;
  detail?: string;
}

export interface IRide extends Document {
  driverName: string;
  driverRating: number;
  driverTrips: number;
  waypoints: IWaypoint[];
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seats: number;
  car: string;
  carYear: number;
  carColor: string;
  carPhoto?: string;
  createdAt: Date;
}

const WaypointSchema = new Schema<IWaypoint>({
  city:   { type: String, required: true },
  lat:    { type: Number, required: true },
  lng:    { type: Number, required: true },
  detail: { type: String },
});

const RideSchema = new Schema<IRide>({
  driverName:   { type: String, required: true },
  driverRating: { type: Number, default: 5.0 },
  driverTrips:  { type: Number, default: 0 },
  waypoints:    { type: [WaypointSchema], required: true },
  date:         { type: String, required: true },
  departureTime:{ type: String, required: true },
  arrivalTime:  { type: String, required: true },
  price:        { type: Number, required: true },
  seats:        { type: Number, required: true },
  car:          { type: String, required: true },
  carYear:      { type: Number, required: true },
  carColor:     { type: String, required: true },
  carPhoto:     { type: String },
  createdAt:    { type: Date, default: Date.now },
});

export default mongoose.model<IRide>('Ride', RideSchema);
