# TROLL NFT 2.0 — V15 Security Hardening

V15 does **not** add product features. It hardens the V14 architecture that already passed Robinhood Chain Testnet.

## Security deltas

- Direct reward routing now records the **actual amount credited** to the passive vault, not merely the amount requested.
- Fee-on-transfer/adversarial ERC-20 behavior is covered by deterministic tests.
- Asset snapshot anchors cannot cite a future block.
- Access-control, frozen-core, bad-family-proof, repeated-reveal, duplicate-vault, wrong-chain-asset, and regulated-lane negative tests are explicit.
- The V14 lifecycle invariant remains mandatory: family, burn history, evolution, reward weight, passive vault, balances and entitlements survive A→B transfer.

## What V15 is not

V15 is not an independent audit and is not permission to deploy production/mainnet.

The mainnet gate remains:
1. independent security review,
2. final production metadata/CIDs,
3. multisig/treasury role configuration,
4. exact production asset allowlist,
5. regulated settlement/compliance path,
6. production deployment rehearsal.
