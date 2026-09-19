# TROLL NFT 2.0 — V28 Reward & Accumulation Ledger

V28 creates a normalized biography of reward/asset events per NFT.

## Why

A TROLL should be able to show **what accumulated, when, under which evidence class, and from which exact chain/contract reference**.

That history can grow indefinitely while remaining auditable.

## Mandatory row identity
Every row includes:
- epoch ID;
- token ID;
- chain ID;
- exact asset contract/reference;
- symbol as display metadata only;
- asset class;
- raw amount;
- decimals;
- evidence label;
- evidence reference.

## Evidence labels
Only:
- LIVE_ONCHAIN_BALANCE
- REGULATED_ENTITLEMENT
- HISTORICAL_PROOF
- REFERENCE_ONLY

## Critical accounting rule
Different contracts, chains, decimals and evidence classes are **never added together**.

V28 aggregates raw units only inside the exact identity tuple:

`chain_id + asset_contract + decimals + evidence_label`

This prevents a dashboard from adding "5 NVDA + 0.1 gold + 1,000 USDC" into a meaningless number.

## Market valuation
USD valuation is a separate optional observation layer and must include:
- price source;
- timestamp;
- quote currency;
- confidence/freshness;
- no representation as protocol revenue.

V28 itself performs no price valuation.

## Reward epochs
An epoch is an accounting grouping, not a promise of future distributions.

Future production epochs should publish:
- epoch manifest hash;
- eligibility rule;
- funding source;
- asset identity;
- per-token allocation;
- execution/settlement evidence.
