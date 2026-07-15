import { Request, Response } from 'express';
import * as rideService from '../services/ride.service';

export async function listRides(req: Request, res: Response): Promise<void> {
  try {
    const { from, to, date, seats } = req.query;
    if (from && to && date) {
      const results = await rideService.searchRides(
        from as string,
        to as string,
        date as string,
        Number(seats) || 1
      );
      res.json(results);
    } else {
      const rides = await rideService.getAllRides();
      res.json(rides);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
}

export async function getRide(req: Request, res: Response): Promise<void> {
  try {
    const ride = await rideService.getRideById(req.params.id);
    if (!ride) { res.status(404).json({ error: 'Ride not found' }); return; }
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ride' });
  }
}

export async function createRide(req: Request, res: Response): Promise<void> {
  try {
    const ride = await rideService.createRide(req.body);
    res.status(201).json(ride);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create ride' });
  }
}
