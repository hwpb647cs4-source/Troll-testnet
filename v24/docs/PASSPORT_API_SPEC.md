# TROLL Passport API — V24

V24 defines a read-only public API/SDK layer on top of the live passport.

## Goals

- make every TROLL token independently queryable by token ID;
- let marketplaces, wallets, explorers and agents consume the same normalized passport;
- keep live balances, historical proofs and regulated entitlements clearly separated;
- never require custody or a private key to read data.

## Suggested endpoints

### GET /v1/passport/{tokenId}
Returns the full normalized passport.

### GET /v1/passport/{tokenId}/summary
Returns a compact collector/marketplace summary.

### GET /v1/passport/{tokenId}/assets
Returns exact-chain/exact-contract live assets only.

### GET /v1/passport/{tokenId}/entitlements
Returns regulated entitlement records separately.

### GET /v1/passport/{tokenId}/stamps
Returns deterministic evidence-backed stamps.

### GET /v1/collection/stats
Returns:
- minted;
- total project TROLL burn;
- family distribution;
- evolution distribution;
- vaults created;
- live asset count;
- entitlement count;
- unique owners;
- transfer count;
- passport views.

## Data labels

Every financial-like row MUST include one of:
- LIVE_ONCHAIN_BALANCE
- REGULATED_ENTITLEMENT
- HISTORICAL_PROOF
- REFERENCE_ONLY

A client must never infer one category from another.

## Trust model

The API is a convenience layer. Canonical truth remains:
- Robinhood Chain state;
- exact contract addresses;
- frozen provenance hashes;
- deterministic derivation rules.

## Noncustodial boundary

Read endpoints:
- do not request wallet connection;
- do not request signatures;
- do not accept private keys;
- do not submit transactions.
