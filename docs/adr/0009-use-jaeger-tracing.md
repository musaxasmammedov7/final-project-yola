# ADR-0009: Use Jaeger for Distributed Tracing

## Status

Accepted

## Context

The application needs distributed tracing to debug requests across microservices. Options:
- **Jaeger**: CNCF project, Elasticsearch backend, Zipkin compatible
- **Zipkin**: Simpler, fewer features
- **Tempo**: Grafana-integrated, newer

## Decision

Use Jaeger with Elasticsearch backend.

## Consequences

### Positive
- CNCF graduated project (mature, well-supported)
- Elasticsearch backend (persistent storage, scalability)
- Zipkin protocol (compatible with Istio)
- Integration with Istio (extensionProviders)
- Grafana datasource (unified observability)

### Negative
- Elasticsearch resource overhead (~500MB memory)
- Complexity (multiple components: collector, query, agent)
- Storage costs (Elasticsearch)

### Alternatives Rejected
- **Zipkin**: Fewer features, no Elasticsearch integration
- **Tempo**: Newer, less mature, no Elasticsearch backend
