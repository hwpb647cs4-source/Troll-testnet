# Production Regulated Asset Lane

This is a deployment policy, not a new holder mechanic.

## Rule

For production V19, the following Robinhood Chain assets are configured in the **REGULATED_ENTITLEMENT** lane, not deposited directly into the permanent passive vault:

- AAPL
- NVDA
- MSFT
- AMZN
- GOOGL
- META
- TSLA
- GLD
- SLV

The exact current chain-4663 contracts come from `production/assets/robinhood-assets.generated.json`, which is generated directly from Robinhood's official RHJ asset API.

## Why

The permanent V19 vault is intentionally non-withdrawable. Regulated/tokenized-security-like assets may also have transfer, eligibility, settlement, or custody restrictions.

Therefore:
- TROLL's permanent vault remains the accumulation identity/custody surface for assets explicitly approved for direct custody;
- regulated Robinhood assets are represented through V19's separate entitlement lane;
- a recorded entitlement is not described as unrestricted legal ownership of the underlying share/trust asset;
- actual regulated settlement/custody remains blocked until the separate legal/compliance gate is approved.

## V19 mapping

`TrollAssetRegistryV19.Lane.REGULATED_ENTITLEMENT`

Asset classes:
- Magnificent Seven → `STOCK`
- GLD → `GOLD`
- SLV → `SILVER`

## Audit finding reconciliation

This policy reduces the operational impact of:
- cross-chain registry misconfiguration: production entries are fixed to chain 4663;
- direct-vault regulated-asset custody ambiguity;
- registry-decimals mistakes: current official snapshot is validated at 18 decimals.

The on-chain privileged functions are still controlled by production admin authority, so the production multisig and final human review remain mandatory.

## Mainnet gate

**REGULATED_SETTLEMENT_APPROVED remains OPEN.**

This file defines the technical lane only. It does not claim legal approval or authorize distribution.
