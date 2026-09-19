# TROLL NFT 2.0 — V26 Event Indexer

V26 replaces collection-wide browser polling with an incremental, event-sourced read model.

## Indexed canonical events

### Genesis NFT
- ERC-721 `Transfer`
  - mint detection
  - ownership changes
  - transfer counts
  - holder-position counts

### Evolution Engine
- `TrollBurned`
  - requested burn
  - actual credited burn
  - cumulative token burn
  - evolution state at event

## Derived collection state
- minted tokens
- unique current owners
- holder positions
- secondary transfer count
- burn-event count
- cumulative project burn
- evolved-token count
- per-token owner / transfer count / burn / state
- transfer timeline
- burn/evolution timeline

## Incremental cursor
The index stores `indexed_through_block`. Subsequent runs resume at the next block rather than rescanning all history.

## Reorg policy for production
Before production:
1. index only finalized/safely confirmed blocks;
2. keep a rewind window;
3. persist block hashes;
4. if a stored block hash changes, rewind and replay;
5. never use the index as canonical truth when it conflicts with chain state.

## Infrastructure
The public Robinhood RPC is acceptable for development and low-volume reads. Production indexing should use a dedicated RPC provider and persistent database/object storage.

## Security boundary
V26:
- has no signing key;
- sends no transaction;
- requests no wallet connection;
- cannot move NFT/vault assets;
- does not modify V19.

The index is a convenience/read-performance layer. Canonical truth remains Robinhood Chain.
