# ADR-0002: Use Istio as Service Mesh

## Status

Accepted

## Context

The application has multiple microservices (frontend, backend, MongoDB, Redis) that need:
- Secure communication (mTLS)
- Traffic management (routing, retries, timeouts)
- Observability (distributed tracing, metrics)

Options:
- **Istio**: Full-featured, complex, resource-heavy
- **Linkerd**: Lightweight, simpler, fewer features
- **No mesh**: No overhead, but no mesh benefits

## Decision

Use Istio as the service mesh.

## Consequences

### Positive
- Automatic mTLS between all services
- Traffic management (VirtualService, HTTPRoute)
- Distributed tracing integration (Jaeger)
- Rich observability (Kiali, Grafana dashboards)
- Production-grade features (circuit breaking, retries)

### Negative
- Resource overhead (~100MB memory per sidecar)
- Complexity (steep learning curve)
- Debugging harder (sidecar proxy issues)

### Alternatives Rejected
- **Linkerd**: Fewer features, no built-in tracing integration
- **No mesh**: No security, no traffic management, no tracing
