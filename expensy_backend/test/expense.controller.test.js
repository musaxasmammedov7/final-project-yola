const assert = require('node:assert/strict');
const test = require('node:test');

const originalConsoleError = console.error;
test.beforeEach(() => { console.error = () => {}; });
test.afterEach(() => { console.error = originalConsoleError; });

function createRes() {
  return {
    statusCode: undefined,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

function loadRideController(serviceMethods) {
  const servicePath = require.resolve('../dist/services/ride.service');
  const controllerPath = require.resolve('../dist/controllers/ride.controller');
  delete require.cache[controllerPath];
  require.cache[servicePath] = {
    id: servicePath, filename: servicePath, loaded: true,
    exports: serviceMethods,
  };
  return require('../dist/controllers/ride.controller');
}

function loadBookingController(serviceMethods) {
  const servicePath = require.resolve('../dist/services/booking.service');
  const controllerPath = require.resolve('../dist/controllers/booking.controller');
  delete require.cache[controllerPath];
  require.cache[servicePath] = {
    id: servicePath, filename: servicePath, loaded: true,
    exports: serviceMethods,
  };
  return require('../dist/controllers/booking.controller');
}

// ── ride controller ──────────────────────────────────────────────────────────

test('listRides returns all rides when no query params', async () => {
  const rides = [{ id: '1', from: 'Baku', to: 'Ganja' }];
  const { listRides } = loadRideController({ getAllRides: async () => rides, searchRides: async () => [] });
  const res = createRes();
  await listRides({ query: {} }, res);
  assert.deepEqual(res.body, rides);
});

test('listRides searches when from/to/date provided', async () => {
  const results = [{ id: '2', from: 'Baku', to: 'Sumgait' }];
  const { listRides } = loadRideController({ getAllRides: async () => [], searchRides: async () => results });
  const res = createRes();
  await listRides({ query: { from: 'Baku', to: 'Sumgait', date: '2026-07-20', seats: '1' } }, res);
  assert.deepEqual(res.body, results);
});

test('listRides returns 500 on service error', async () => {
  const { listRides } = loadRideController({ getAllRides: async () => { throw new Error('db down'); } });
  const res = createRes();
  await listRides({ query: {} }, res);
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Failed to fetch rides' });
});

test('getRide returns 404 when not found', async () => {
  const { getRide } = loadRideController({ getRideById: async () => null });
  const res = createRes();
  await getRide({ params: { id: 'nonexistent' } }, res);
  assert.equal(res.statusCode, 404);
});

test('createRide returns 201 with created ride', async () => {
  const ride = { id: '3', from: 'Baku', to: 'Sheki' };
  const { createRide } = loadRideController({ createRide: async () => ride });
  const res = createRes();
  await createRide({ body: { from: 'Baku', to: 'Sheki' } }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, ride);
});

// ── booking controller ───────────────────────────────────────────────────────

test('listBookings returns bookings', async () => {
  const bookings = [{ id: 'b1', rideId: '1' }];
  const { listBookings } = loadBookingController({ getAllBookings: async () => bookings });
  const res = createRes();
  await listBookings({}, res);
  assert.deepEqual(res.body, bookings);
});

test('listBookings returns 500 on error', async () => {
  const { listBookings } = loadBookingController({ getAllBookings: async () => { throw new Error('fail'); } });
  const res = createRes();
  await listBookings({}, res);
  assert.equal(res.statusCode, 500);
});

test('createBooking returns 201', async () => {
  const booking = { id: 'b2', rideId: '1', passengerName: 'Ali' };
  const { createBooking } = loadBookingController({ createBooking: async () => booking });
  const res = createRes();
  await createBooking({ body: {} }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, booking);
});

test('createBooking returns 400 with error message on failure', async () => {
  const { createBooking } = loadBookingController({ createBooking: async () => { throw new Error('Not enough seats'); } });
  const res = createRes();
  await createBooking({ body: {} }, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Not enough seats' });
});
