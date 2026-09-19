# TROLL NFT 2.0 — V47 Observability & Service Objectives

V47 defines how we know the product is healthy instead of waiting for users to discover failures.

## Initial service objectives

### Passport freshness
Target: <= 120 seconds for data represented as current.

If freshness exceeds the threshold, the UI should label it stale rather than silently showing old financial-like state as current.

### Index lag
Target: <= 20 blocks under normal operation.

### RPC read success
Target: >= 99.50%.

### Proof verification
Target: 100% for generated proof bundles.

### False financial state
Target: **0**.

Any known case where the UI represents uncertain/incorrect financial-like state as verified is a critical product incident.

### Release-gate bypass
Target: **0**.

## Degraded mode
When infrastructure is degraded:
- preserve read-only access where safe;
- show freshness/status;
- avoid pretending cached data is live;
- disable or hide dependent actions;
- keep blockchain canonical.

## Alerts
Production alerts should cover:
- index lag;
- RPC failures;
- proof verification failures;
- stale Passport data;
- asset-registry verification failures;
- release-control changes;
- security incidents.

## Privacy
Observability must follow V46: aggregate-first and no wallet secrets/precise-location collection.

## Boundary
V47 adds no contracts, signing or transactions.
