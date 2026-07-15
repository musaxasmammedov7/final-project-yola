import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const latencyP95 = new Trend('latency_p95');

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp up to 50 req/s
    { duration: '1m', target: 200 },    // ramp up to 200 req/s
    { duration: '2m', target: 350 },    // sustained load at 350 req/s
    { duration: '30s', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],   // 95% of requests must be < 300ms
    errors: ['rate<0.01'],              // error rate must be < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://yola-istio-ingress.swedencentral.cloudapp.azure.com';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });

  errorRate.add(res.status !== 200);
  latencyP95.add(res.timings.duration);

  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'load-test/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const lines = [];
  lines.push('');
  lines.push('========================================');
  lines.push('         LOAD TEST SUMMARY');
  lines.push('========================================');
  lines.push('');
  lines.push(`Total requests: ${data.metrics.http_reqs?.values?.count || 0}`);
  lines.push(`Request rate:   ${(data.metrics.http_reqs?.values?.rate || 0).toFixed(2)} req/s`);
  lines.push(`Avg duration:   ${(data.metrics.http_req_duration?.values?.avg || 0).toFixed(2)} ms`);
  lines.push(`P95 duration:   ${(data.metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)} ms`);
  lines.push(`P99 duration:   ${(data.metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)} ms`);
  lines.push(`Error rate:     ${((data.metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%`);
  lines.push('');
  lines.push('Thresholds:');
  for (const [name, threshold] of Object.entries(data.thresholds || {})) {
    lines.push(`  ${name}: ${threshold.ok ? 'PASSED' : 'FAILED'}`);
  }
  lines.push('');
  lines.push('========================================');
  return lines.join('\n');
}
