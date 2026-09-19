# TROLL NFT 2.0 — V25 Collection Intelligence

V25 aggregates the read-only Live Passport into collection-level intelligence.

## Live metrics
- minted / 5,000;
- unique current owners;
- cumulative project TROLL burn;
- evolved NFT count and percentage;
- family distribution;
- evolution-state distribution;
- token-level owner/family/state/burn/weight.

## Evidence metrics
Historical proof records are counted separately from live balances:
- known proof passports;
- direct-asset proof rows;
- regulated-entitlement proof rows.

## Scaling rule
The browser uses bounded concurrency rather than firing thousands of RPC requests simultaneously. A production indexer/API should replace browser-wide scanning as the collection grows.

## Integrity rule
No floor price, market cap, or nominal asset value is included in the protocol-health score. Those may be displayed separately as market observations, never as verified protocol revenue or guaranteed NFT value.

V25 adds no Solidity and does not modify V19.
