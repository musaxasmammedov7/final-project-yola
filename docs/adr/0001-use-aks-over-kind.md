# ADR-0001: Use AKS over Kind for Production

## Status

Accepted

## Context

The project needs a Kubernetes cluster for deploying microservices. Options:
- **Kind** (local): Free, fast, but no cloud features
- **AKS** (Azure): Managed, production-ready, but costs money

## Decision

Use Azure Kubernetes Service (AKS) for the production environment.

## Consequences

### Positive
- Managed control plane (Azure handles upgrades, patching)
- Integration with Azure services (Key Vault, ACR, Monitor)
- Node autoscaling (system pool: D2s_v3, 1-2 nodes)
- Production-grade networking and security
- Azure for Students provides free credits

### Negative
- Cost (mitigated by Azure for Students)
- More complex setup than Kind
- Requires Azure subscription and identity management

### Alternatives Rejected
- **Kind**: No cloud integration, no autoscaling, not production-ready
- **EKS**: More expensive, not available in Azure for Students
- **GKE**: Not available in Azure for Students
