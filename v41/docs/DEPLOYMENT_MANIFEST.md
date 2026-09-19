# TROLL NFT 2.0 — V41 Deterministic Deployment Manifest

V41 prepares the final production rehearsal evidence without broadcasting anything.

## Manifest freezes
- Robinhood Chain ID 4663;
- exact reviewed source commit;
- contract names;
- creation bytecode SHA-256;
- runtime bytecode SHA-256;
- constructor arguments and their hash;
- expected addresses when deterministic/predicted;
- public production role addresses;
- metadata manifest hash;
- asset-registry manifest hash.

## Rehearsal comparison
After a local/test rehearsal, observed runtime bytecode/address data is compared against the frozen manifest.

Any mismatch blocks deployment.

## Mainnet rule
A mainnet deployment must not be treated as valid merely because transactions succeeded. The observed runtime bytecode, addresses, constructor configuration, roles, metadata and asset registry must reconcile to the reviewed/frozen release package.

## Current status
**FINAL_DEPLOYMENT_REHEARSAL = OPEN**

The audit, roles, metadata and exact asset registry are not all closed yet, so V41 intentionally cannot produce a production-ready manifest today.

## Security
No RPC signing, no wallet keys, no transaction broadcasting and no Solidity changes.
