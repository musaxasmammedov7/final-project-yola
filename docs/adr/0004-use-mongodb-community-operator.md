# ADR-0004: Use MongoDB Community Operator

## Status

Accepted

## Context

The application needs a document database. Options:
- **MongoDB Community Operator**: Free, Kubernetes-native, replica set support
- **MongoDB Atlas**: Managed, but costs money
- **PostgreSQL**: Relational, not ideal for document storage
- **Redis**: Cache only, not primary database

## Decision

Use MongoDB Community Operator with Kubernetes custom resource.

## Consequences

### Positive
- Kubernetes-native (MongoDBCommunity CRD)
- Replica set support (1 replica due to resource constraints)
- No vendor lock-in (open source)
- Integration with Kubernetes secrets

### Negative
- Manual operations (scaling, backups)
- Resource constraints (1 replica instead of 3)
- No managed backups (unlike Atlas)

### Alternatives Rejected
- **MongoDB Atlas**: Costs money, requires additional setup
- **PostgreSQL**: Relational model doesn't fit expense tracking
- **Redis**: Cache only, not suitable for primary storage
