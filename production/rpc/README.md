# Production RPC Preflight

Robinhood's official documentation identifies **Alchemy** as its recommended infrastructure provider for Robinhood Chain production use and lists mainnet chain ID **4663**.

This repository never stores an API key.

## Required secret

Configure:

`RH_RPC_URL`

in the deployment environment/secrets manager.

Expected provider format can be Alchemy or another production-grade provider, but the endpoint must resolve to Robinhood Chain mainnet.

## Preflight

The script:
1. refuses missing/placeholding endpoints;
2. calls `eth_chainId`;
3. requires chain ID 4663;
4. calls `eth_blockNumber`;
5. prints only redacted health data.

No transactions are signed or broadcast.

## Release gate

`DEDICATED_PRODUCTION_RPC` remains OPEN until a private production endpoint is supplied and this preflight passes.

Public Robinhood RPC endpoints remain useful for low-volume reads/testing but are documented by Robinhood as rate-limited and not recommended for production-grade applications.
