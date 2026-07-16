import { Router } from 'express';
import { listRides, getRide, createRide, deleteAllRides } from '../controllers/ride.controller';

const router = Router();

router.get('/rides', listRides);
router.get('/rides/:id', getRide);
router.post('/rides', createRide);
router.delete('/rides', deleteAllRides);

export default router;
