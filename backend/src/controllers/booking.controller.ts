import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';

export async function listBookings(req: Request, res: Response): Promise<void> {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

export async function getBooking(req: Request, res: Response): Promise<void> {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
}

export async function createBooking(req: Request, res: Response): Promise<void> {
  try {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create booking' });
  }
}
