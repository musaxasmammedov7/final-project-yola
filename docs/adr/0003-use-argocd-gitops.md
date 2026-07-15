# ADR-0003: Use ArgoCD for GitOps

## Status

Accepted

## Context

The project needs a GitOps solution to manage Kubernetes manifests. Options:
- **ArgoCD**: Declarative, UI, App-of-Apps pattern
- **Flux**: CLI-based, simpler, fewer features
- **Manual kubectl**: No automation, error-prone

## Decision

Use ArgoCD with App-of-Apps pattern.

## Consequences

### Positive
- Declarative: Git is the source of truth
- Self-healing: ArgoCD reconciles drift
- App-of-Apps: Parent app manages child apps
- UI: Visualize sync status, diffs, history
- Rollback: `git revert` triggers automatic rollback

### Negative
- Resource overhead (~200MB memory)
- Complexity (multiple Application CRDs)
- Learning curve for App-of-Apps pattern

### Alternatives Rejected
- **Flux**: No UI, CLI-only, less intuitive
- **Manual kubectl**: No audit trail, no self-healing, error-prone
