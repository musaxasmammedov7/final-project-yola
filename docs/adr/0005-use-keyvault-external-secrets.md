# ADR-0005: Use Azure Key Vault + External Secrets Operator

## Status

Accepted

## Context

The application needs to store secrets (database credentials, API keys). Options:
- **Kubernetes Secrets**: Simple, but stored in cluster (risk of exposure)
- **Azure Key Vault**: Managed, encrypted, but requires integration
- **HashiCorp Vault**: Powerful, but complex setup

## Decision

Use Azure Key Vault with External Secrets Operator (ESO).

## Consequences

### Positive
- Secrets stored in Azure Key Vault (encrypted at rest)
- ESO syncs secrets to Kubernetes Secrets automatically
- No secrets in Git (ExternalSecret manifests only reference names)
- Integration with Azure managed identity (no passwords)
- Audit trail (Key Vault logs who accessed secrets)

### Negative
- Additional component (ESO) to manage
- Network dependency (ESO must reach Key Vault)
- Cost (Key Vault operations)

### Alternatives Rejected
- **Kubernetes Secrets**: Stored in cluster, risk of exposure via etcd
- **HashiCorp Vault**: Complex setup, overkill for this project
