import { Router } from 'express';
import { listBookings, getBooking, createBooking } from '../controllers/booking.controller';

const router = Router();

router.get('/bookings', listBookings);
router.get('/bookings/:id', getBooking);
router.post('/bookings', createBooking);

export default router;
