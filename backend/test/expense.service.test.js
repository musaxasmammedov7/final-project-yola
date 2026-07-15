const assert = require('node:assert/strict');
const test = require('node:test');

const originalConsoleLog = console.log;
test.beforeEach(() => { console.log = () => {}; });
test.afterEach(() => { console.log = originalConsoleLog; });

function loadRideService({ cachedRides, dbRides } = {}) {
  const rideModelPath = require.resolve('../dist/models/ride.model');
  const redisPath = require.resolve('../dist/config/redis');
  const servicePath = require.resolve('../dist/services/ride.service');

  delete require.cache[servicePath];

  const redisCalls = { get: [], setex: [], del: [] };
  const redisMock = {
    get: async key => { redisCalls.get.push(key); return cachedRides ?? null; },
    setex: async (...args) => { redisCalls.setex.push(args); },
    del: async key => { redisCalls.del.push(key); },
  };

  const rideModelMock = {
    find: () => ({ sort: () => ({ lean: async () => dbRides ?? [] }), lean: async () => dbRides ?? [] }),
    findById: async () => null,
  };

  require.cache[redisPath] = {
    id: redisPath, filename: redisPath, loaded: true,
    exports: { __esModule: true, default: redisMock },
  };
  require.cache[rideModelPath] = {
    id: rideModelPath, filename: rideModelPath, loaded: true,
    exports: { __esModule: true, default: rideModelMock },
  };

  return { service: require('../dist/services/ride.service'), redisCalls };
}

test('getAllRides returns cached rides without querying DB', async () => {
  const cached = [{ id: '1', from: 'Baku', to: 'Ganja' }];
  const { service, redisCalls } = loadRideService({ cachedRides: JSON.stringify(cached) });
  const result = await service.getAllRides();
  assert.deepEqual(result, cached);
  assert.deepEqual(redisCalls.get, ['rides:all']);
  assert.deepEqual(redisCalls.setex, []);
});

test('getAllRides stores DB result in Redis when cache empty', async () => {
  const dbRides = [{ id: '2', from: 'Baku', to: 'Sheki' }];
  const { service, redisCalls } = loadRideService({ dbRides });
  const result = await service.getAllRides();
  assert.deepEqual(result, dbRides);
  assert.deepEqual(redisCalls.get, ['rides:all']);
  assert.equal(redisCalls.setex.length, 1);
  assert.equal(redisCalls.setex[0][0], 'rides:all');
});
