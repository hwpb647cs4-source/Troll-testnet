# Production Settlement / Compliance Lock

This is a release-control document, not legal advice and not a new product feature.

## Default production posture

**REGULATED REWARDS DISABLED**

The technical registry for AAPL, NVDA, MSFT, AMZN, GOOGL, META, TSLA, GLD and SLV is verified, but those assets remain **disabled for production reward/settlement use** until the separate compliance gate passes.

## Official Robinhood Chain constraints

Robinhood's current documentation says:

- Stock Tokens are tokenised debt securities issued by Robinhood Assets (Jersey) Limited.
- They provide economic exposure but do not grant legal or beneficial ownership rights in the underlying shares/ETFs.
- They are standard ERC-20 tokens with 18 decimals.
- Stock Tokens may not be offered, sold, or delivered in the United States or to, or for the account or benefit of, U.S. persons.
- Direct primary issuance is restricted to Authorised Participants.
- External-facing copy should use **Stock Tokens** or **tokenized real-world assets such as Stock Tokens**, not "tokenized stocks" or "tokenized equities".

Source:
- https://docs.robinhood.com/chain/stock-tokens/
- https://docs.robinhood.com/chain/terms-of-service/
- https://docs.robinhood.com/chain/brand-guidelines/

## V19 production behavior until approval

Allowed:
- read-only registry/metadata display;
- testnet mock-asset tests;
- family/theme metadata;
- deployment rehearsal with regulated-entitlement functions unused.

Disabled:
- recording real Stock Token entitlements for users;
- distributing real Stock Tokens as rewards;
- depositing regulated Robinhood assets into permanent vaults;
- marketing an NFT as owning the underlying stock.

## Gate

`REGULATED_SETTLEMENT_APPROVED = OPEN`

This gate can close only after qualified legal/compliance review confirms the production user/jurisdiction, custody/settlement, transfer-restriction and disclosure model.

This lock lets the rest of the contracts deploy safely without accidentally turning a technically available ERC-20 integration into an unauthorized regulated distribution flow.
