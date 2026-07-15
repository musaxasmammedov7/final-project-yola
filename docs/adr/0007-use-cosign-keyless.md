# ADR-0007: Use Cosign Keyless for Image Signing

## Status

Accepted

## Context

Container images need to be signed to ensure supply chain security. Options:
- **Cosign keyless**: OIDC-based, no key management
- **Cosign with keys**: Traditional key-based, more control
- **Notary**: Complex setup, less integration

## Decision

Use Cosign in keyless mode with Fulcio/Rekor.

## Consequences

### Positive
- No key management (OIDC identity from GitHub Actions)
- Transparent signing (Fulcio CA + Rekor transparency log)
- Kyverno can verify signatures automatically
- Industry standard (Sigstore project)

### Negative
- Dependency on Fulcio/Rekor infrastructure
- No key rotation needed (but also no key revocation)
- Less control than key-based signing

### Alternatives Rejected
- **Cosign with keys**: Key management overhead, risk of key leakage
- **Notary**: Complex setup, less community adoption
