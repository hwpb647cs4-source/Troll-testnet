# TROLL NFT 2.0 — V32 Release Control Plane

V32 turns the accumulated engineering work into one explicit release-state machine.

## Current state

**NO MAINNET BROADCAST**

The release manifest is machine-readable. A gate is either:
- PASS
- OPEN

Anything other than PASS blocks production.

## Gates already passed
- V14 full Robinhood Chain testnet lifecycle
- V19 Slither 0 High / 0 Medium
- V20 reproducible audit freeze
- V21 production rehearsal
- V31 tamper-evident proof bundles

## External/production gates still open
- independent human audit
- final reviewed commit freeze
- production multisig
- production metadata CIDs
- exact production asset registry
- regulated settlement approval/path
- dedicated production RPC
- final deployment rehearsal
- explicit mainnet authorization

## Why
The product can continue improving in read-only analytics, Passport, SDK, evidence and business tooling without silently converting those improvements into permission to deploy money-moving contracts.

The contract release and product-data release are intentionally separated.
