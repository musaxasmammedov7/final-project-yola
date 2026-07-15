# ADR-0006: Use Kyverno for Policy Enforcement

## Status

Accepted

## Context

The cluster needs admission control to enforce security policies. Options:
- **Kyverno**: Kubernetes-native, YAML-based policies
- **OPA Gatekeeper**: Rego-based policies, steeper learning curve
- **Pod Security Standards**: Namespace labels, limited flexibility

## Decision

Use Kyverno for policy enforcement.

## Consequences

### Positive
- Kubernetes-native (CRDs, not Rego)
- Policies as YAML (easy to read/write)
- Verify image signatures (Cosign)
- Block latest tags, enforce resource limits
- Audit mode (log violations without blocking)

### Negative
- Resource overhead (~100MB memory)
- Learning curve for policy authoring
- Debugging policy violations

### Alternatives Rejected
- **OPA Gatekeeper**: Rego language is complex, less intuitive
- **Pod Security Standards**: Limited flexibility, no image verification
