# Load Testing

Performance testing with k6 to validate HPA behavior.

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Windows
winget install k6

# Linux
sudo snap install k6
```

## Running the Test

```bash
# Set the target URL
export BASE_URL=https://<istio-ip>

# Run the load test
k6 run load-test/items-load.js
```

## What It Tests

| Metric | Target | Why |
|--------|--------|-----|
| Request rate | 350 req/s | Simulate real-world traffic |
| P95 latency | < 300ms | User experience |
| Error rate | < 1% | Reliability |

## Expected Behavior

1. **0-30s**: Ramp up to 50 req/s
2. **30s-90s**: Ramp up to 200 req/s
3. **90s-210s**: Sustained load at 350 req/s
4. **210s-240s**: Ramp down

During sustained load:
- CPU usage increases
- HPA scales from 2 → 3 → 4 → 5 pods
- Response time stabilizes

## Grafana Dashboard

Open the Grafana dashboard during the test to observe:
- Pod count increasing
- CPU utilization
- Request rate
- Response latency

## Interpreting Results

```
PASSED: All thresholds met
FAILED: One or more thresholds not met
```

Common issues:
- P95 > 300ms: Backend needs optimization
- Error rate > 1%: Backend struggling under load
- HPA not scaling: Check resource requests/limits
