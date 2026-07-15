import { Router } from 'express';
import { listRides, getRide, createRide } from '../controllers/ride.controller';

const router = Router();

router.get('/rides', listRides);
router.get('/rides/:id', getRide);
router.post('/rides', createRide);

export default router;
