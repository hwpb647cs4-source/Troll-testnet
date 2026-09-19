# TROLL NFT 2.0 — V37 Production Asset Verification

V37 prepares the exact-asset verification pipeline required before any production Stock Token integration.

## Official source
Robinhood's read-only Stock Token API exposes:
- asset UID;
- token symbol/name;
- status;
- per-chain deployment contract;
- current/pending corporate-action multiplier;
- trading capabilities.

Official endpoint:

`GET https://api.robinhood.com/rhj/assets`

## Canonical identity
A production Stock Token is never identified by ticker alone.

TROLL requires:

`chain ID + exact contract address + official asset record`

A matching ticker at another address fails verification.

## Corporate actions
The current multiplier must be retained as asset metadata. Splits/dividends and other supported corporate actions can change economic interpretation without changing a raw ERC-20 balance.

Any future valuation layer must reconcile:
- raw token balance;
- current multiplier;
- price source semantics;
- timestamp/freshness.

## Legal/economic labeling
Robinhood Stock Tokens are tokenized debt securities issued by Robinhood Assets (Jersey) Limited. They provide economic exposure to an underlying security but do not themselves grant legal or beneficial rights in that underlying security.

The Passport must therefore avoid language such as "owns Apple shares" unless a separate legally valid instrument actually supports that statement.

## Eligibility/restrictions
Production use must respect applicable offering/transfer restrictions and jurisdictional eligibility. Asset technical verification does not equal legal/compliance approval.

Therefore the V32 gate `REGULATED_SETTLEMENT_APPROVED` remains independent from `EXACT_ASSET_REGISTRY`.

## Mainnet
Robinhood Chain mainnet chain ID: **4663**.

The public RPC is rate-limited and not intended for production-grade indexing. V37 asset metadata uses the official read-only REST API; production blockchain reads should use a dedicated provider.
