# TROLL NFT 2.0 — V44 Data Recovery & Integrity

V44 prepares recovery for the read-side infrastructure: indexer, Passport evidence, collection analytics and proof roots.

## Canonical truth
The blockchain remains canonical. A database/index snapshot is a performance/recovery artifact, never a replacement for chain state.

## Recovery snapshot
A verified snapshot records:
- chain ID;
- indexed-through block;
- canonical block hash;
- SHA-256 of the index state;
- collection proof root when available;
- snapshot timestamp;
- SHA-256 of the snapshot manifest.

## Restore rule
A snapshot may be restored only if:
1. its own hash verifies;
2. its index-state hash verifies;
3. the recorded block hash still matches the canonical chain.

If the block hash no longer matches, rewind before that point and replay.

## Backup strategy for production
- frequent incremental index snapshots;
- periodic full snapshots;
- at least two independent storage locations;
- immutable/versioned retention for security evidence;
- restoration drill before mainnet;
- never store wallet seeds/private keys in backups.

## Failure modes
- lost index database → restore verified snapshot and replay;
- corrupted snapshot → reject and select older verified point;
- chain reorg → rewind/replay from safe block;
- Passport cache corruption → regenerate from index/chain;
- proof bundle loss → regenerate from canonical evidence;
- analytics loss → recompute from index history.

## Production gate
A successful restore drill should be required before final deployment rehearsal closes.

V44 adds no Solidity and no transaction capability.
