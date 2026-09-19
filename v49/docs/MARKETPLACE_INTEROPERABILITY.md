# TROLL NFT 2.0 — V49 Marketplace Interoperability

V49 creates a conservative metadata adapter for NFT marketplaces and wallets.

## Goal
A marketplace should understand the collectible identity without having to understand the entire financial/evidence system.

## Marketplace-safe traits
- Series
- Family
- Evolution
- Rarity
- Reward Weight Tier
- Vault Status
- History Status

## Deliberately excluded from marketplace traits
- nominal USD value;
- floor-value projections;
- guaranteed yield/return;
- raw regulated entitlement amounts presented as share ownership;
- sensitive holder information.

Detailed financial-like evidence belongs in the Value Passport, where it can carry exact chain/contract/evidence labels and freshness.

## Immutable media
Production marketplace metadata requires content-addressed image URIs such as IPFS/Arweave.

## Dynamic state
Evolution can change. The metadata router may select a state-specific frozen metadata object. Each allowed production state should ultimately be covered by the V39 metadata freeze.

## External URL
A marketplace token can link to the Live Passport for deeper evidence without embedding every changing field in marketplace metadata.

## Security
V49 adds no Solidity and does not alter V19.
