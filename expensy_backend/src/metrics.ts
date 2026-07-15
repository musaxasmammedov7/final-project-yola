import client from 'prom-client';
import Ride from './models/ride.model';
import Booking from './models/booking.model';
import { Request, Response, NextFunction } from 'express';

const ridesCountGauge = new client.Gauge({
  name: 'rides_total',
  help: 'Total number of rides listed',
});

const bookingsCountGauge = new client.Gauge({
  name: 'bookings_total',
  help: 'Total number of bookings made',
});

async function updateMetrics(): Promise<void> {
  try {
    ridesCountGauge.set(await Ride.countDocuments());
    bookingsCountGauge.set(await Booking.countDocuments());
  } catch (err) {
    console.error('Error updating metrics:', err);
  }
}

setInterval(updateMetrics, 60000);
updateMetrics();

const totalHttpRequestsCounter = new client.Counter({
  name: 'http_requests_overall_total',
  help: 'Overall total number of HTTP requests',
});

const httpRequestsCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests with labels',
  labelNames: ['method', 'route', 'statusCode'],
});

export function httpMetricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on('finish', () => {
    const method = req.method;
    const route = req.originalUrl || req.url;
    const statusCode = res.statusCode.toString();
    httpRequestsCounter.labels(method, route, statusCode).inc();
    totalHttpRequestsCounter.inc();
  });
  next();
}
