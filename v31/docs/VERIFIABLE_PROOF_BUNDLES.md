# TROLL NFT 2.0 — V31 Verifiable Proof Bundles

V31 packages a TROLL's Passport, evolution state, accumulation biography, timeline and index evidence into a deterministic proof bundle.

## Purpose

A collector, marketplace, grant reviewer or partner should be able to receive one JSON object and verify that it has not been silently modified after export.

## Bundle
Each bundle contains:
- token ID;
- chain ID and as-of block;
- owner/family/provenance;
- evolution state and cumulative TROLL burn;
- persistent vault address;
- reward biography;
- proof-of-accumulation timeline;
- index evidence;
- evidence-label policy;
- canonical SHA-256 bundle hash.

## Tamper evidence
The bundle hash is derived from canonical JSON content. Changing the family, burn, owner, state, reward history or timeline changes the hash.

This proves **bundle integrity**, not that an off-chain statement is true. Blockchain facts should still be checked against the chain.

## Collection proof root
V31 can combine individual bundle hashes into one SHA-256 Merkle-style collection root.

This enables a future periodic collection snapshot:
- 5,000 token proof hashes;
- one collection root;
- timestamp/block;
- public archive.

The root can later be anchored on-chain if separately reviewed and authorized. V31 itself does not anchor or broadcast anything.

## Partner/grant use
A grant submission can include:
- testnet proof;
- audit target;
- Slither baseline;
- token proof bundle;
- collection proof root;
- reproducible CI evidence.

This is much stronger than screenshots because the evidence package is machine-verifiable.
