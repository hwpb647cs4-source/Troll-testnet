# Production Asset Registry Policy

TROLL V15/V16 treats an asset as identified by **(chain ID, contract address)**.

A ticker such as AAPL, NVDA, GOLD or SILVER is display metadata only.

Before an asset becomes enabled:
1. Confirm Robinhood Chain ID 4663.
2. Obtain the current checksummed contract address from the issuer/official API or other authoritative source.
3. Confirm token decimals and contract bytecode.
4. Record whether the asset belongs in DIRECT_VAULT or REGULATED_ENTITLEMENT.
5. For stock-token-like assets, confirm current transfer/trading restrictions and corporate-action/multiplier handling before enabling settlement.
6. Record evidence source and timestamp in the production manifest.
7. Revalidate immediately before deployment.

No automatic wildcard registration is permitted.
