# TROLL NFT 2.0 — V27 Historical Intelligence

V27 turns the V26 event index into historical product intelligence without changing any contract.

## New derived views

### Ownership biography
- ownership periods per NFT;
- observed holding duration;
- current holder duration;
- collection median holding duration;
- transfer count.

### Evolution biography
- ordered burn events;
- state-transition history;
- block/timestamp evidence;
- current state.

### Burn momentum
- credited TROLL burned in the latest 24-hour window;
- credited TROLL burned in the previous 24-hour window;
- acceleration ratio;
- daily collection burn series.

This is descriptive protocol activity, **not a price or investment prediction**.

### Activity feed
Normalized:
- MINT
- TRANSFER
- TROLL_BURN

The feed can later include reward epochs, entitlement events and agent actions once their exact event sources are configured.

## Holder-retention interpretation

Holding duration is a behavioral protocol metric. It can help us understand whether collectors retain or transfer NFTs, but it must not be described as guaranteed conviction, investment quality or future price performance.

## Production scaling

The analytics layer consumes V26's persistent index. It should not rescan Robinhood Chain for every page view.

## Security boundary

V27 is pure read/derive logic:
- no wallet connection;
- no signing;
- no transaction broadcast;
- no custody;
- no V19 modification.
