# Production Robinhood Asset Registry

This is deployment configuration, not a new product feature.

The registry is generated directly from Robinhood's official RHJ assets API:

`https://api.robinhood.com/rhj/assets`

Required production stock families:
- AAPL
- NVDA
- MSFT
- AMZN
- GOOGL
- META
- TSLA

Additional requested commodity references:
- GLD
- SLV

Each usable production record must resolve uniquely to:
- Robinhood Chain mainnet chain ID 4663;
- exact contract address;
- active asset status;
- 18 decimals for the current Robinhood Stock Token set;
- current/pending multiplier metadata.

The generated file is evidence/configuration only. Regulated-settlement/compliance approval remains a separate release gate, and the official API must be fetched again immediately before mainnet freeze because deployments/status/multipliers can change.
