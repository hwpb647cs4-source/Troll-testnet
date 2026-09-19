# TROLL NFT 2.0 — V38 Corporate-Action Integrity

V38 protects the Passport and accumulation history from a subtle RWA problem: **a raw token balance can stay constant while the economic interpretation changes.**

## Rule

For a verified Robinhood Stock Token, TROLL stores both:
- raw token balance;
- official current multiplier observed at a specific time/block/API snapshot.

The raw balance is never rewritten to make history look different.

## Multiplier changes

When the official asset record changes its current or pending multiplier:
1. keep the previous observation;
2. record the new observation;
3. create a new proof snapshot;
4. mark the Passport timeline with `CORPORATE_ACTION_OBSERVED`;
5. recompute exposure metadata for display;
6. never describe the result as direct legal ownership of the underlying stock.

## Exact identity

Corporate-action history is attached to:

`asset UID + chain ID + exact contract address`

A ticker alone is insufficient.

## Historical integrity

If an NFT held 5 raw token units before a multiplier change, the historical record continues to say 5 raw units. The new multiplier is an additional evidence layer.

This prevents retroactively rewriting the NFT's accumulation biography.

## Valuation separation

V38 does not calculate USD market value and does not convert exposure metadata into project revenue.

## Security boundary

V38 is read/derive logic only. It adds no Solidity and does not modify V19.
