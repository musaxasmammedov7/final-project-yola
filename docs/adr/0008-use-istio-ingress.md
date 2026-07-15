# ADR-0008: Use Istio IngressGateway for Ingress

## Status

Accepted

## Context

The application needs ingress routing. Options:
- **Istio IngressGateway**: Part of Istio, mTLS, traffic management
- **NGINX Ingress**: Lightweight, simpler, less features
- **Azure Application Gateway**: Managed, but costs money

## Decision

Use Istio IngressGateway for ingress.

## Consequences

### Positive
- Integrated with Istio service mesh
- mTLS for all ingress traffic
- Traffic management (routing, retries, timeouts)
- TLS termination with Let's Encrypt certificates
- HTTPRoute for Kubernetes Gateway API

### Negative
- Resource overhead (Envoy proxy)
- Complexity (VirtualService, Gateway, HTTPRoute)
- Debugging ingress issues harder

### Alternatives Rejected
- **NGINX Ingress**: No mTLS integration, no traffic management
- **Azure Application Gateway**: Costs money, less flexibility
