import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import client from 'prom-client';
import connectDB from './config/db.config';
import { httpMetricsMiddleware } from './metrics';
import './metrics';
import rideRoutes from './routes/ride.route';
import bookingRoutes from './routes/booking.route';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(httpMetricsMiddleware);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

client.collectDefaultMetrics();

app.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : 'Unknown error';
    res.status(500).end(msg);
  }
});

app.use('/api', rideRoutes);
app.use('/api', bookingRoutes);

connectDB();

export default app;
