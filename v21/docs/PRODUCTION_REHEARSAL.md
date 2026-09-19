# V21 Production Deployment Rehearsal — V19 Target

This stage remains **NO BROADCAST**.

## Network

- Robinhood Chain mainnet
- Chain ID: **4663**
- Gas token: **ETH**
- Public RPC: `https://rpc.mainnet.chain.robinhood.com`
- Explorer: `https://robinhoodchain.blockscout.com`

The public RPC is for low-volume access and rehearsal checks. Production should use a dedicated provider endpoint supplied through `RH_RPC_URL`.

## Exact source target

`c3750b9458156e962393059f78c92e79802bf622`

No production deploy should be generated from a different source commit without updating the independent-review target.

## Deployment order rehearsal

1. deploy Genesis NFT;
2. deploy Evolution Engine;
3. deploy passive Vault Factory;
4. deploy Metadata Router;
5. deploy Asset Registry;
6. deploy Reward Router;
7. deploy Lens;
8. deploy Snapshot Anchor;
9. configure core addresses;
10. transfer admin ownership to final multisig;
11. verify all contracts on Blockscout;
12. register only independently verified production assets;
13. mint/reveal a controlled rehearsal token only if explicitly authorized for mainnet rehearsal;
14. compare deployed runtime bytecode hashes against reviewed build manifest.

## Asset-registration rule

Production asset identity is **chain ID + contract address**.

Never register a token from symbol/name alone. The Robinhood Chain official contract registry should be checked immediately before any asset is enabled.

## Stop conditions

Stop before broadcast if any one of these is unresolved:
- independent audit;
- metadata/CID freeze;
- multisig signer setup;
- asset-contract verification;
- regulated-settlement classification;
- dedicated RPC provider;
- constructor-argument manifest;
- bytecode hash mismatch;
- Blockscout verification rehearsal;
- final written authorization.
