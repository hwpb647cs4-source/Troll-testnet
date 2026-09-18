# TROLL NFT 2.0 — Testnet

TROLL NFT 2.0 has completed its first end-to-end Robinhood Chain Testnet proof.

## Testnet milestone

**PASS — 2026-09-18**

The proof demonstrated:

`mint → frozen NVIDIA family → bound vault → burn 175,000 tTROLL → ASCENDED → 2.00x reward weight → deposit 1,000 tUSD → transfer NFT A→B → verify state and vault persistence`

See [TESTNET_PROOF.md](./TESTNET_PROOF.md) for the recorded addresses, transaction and assertions.

## Live launcher

https://hwpb647cs4-source.github.io/Troll-testnet/

## Important

This repository currently hosts a simplified testnet proof, not the production deployment. Production remains gated by the full contract integration and independent security review.


## V14 production-candidate milestone

**CI GREEN — 2026-09-18**

The repository now includes the V14 production-candidate core under `/v14`. GitHub Actions successfully completed:

- pinned dependency installation
- 13/13 static invariant checks
- Solidity 0.8.24 compilation
- full lifecycle + asset-lane acceptance test

The V14 test proves the frozen NVIDIA family, 175,000 TROLL burn → ASCENDED / 2.00x, deterministic passive vault, direct tUSD/tGOLD/tSILVER accumulation, regulated tNVDA entitlement behavior, and A→B persistence.

V14 is still a **testnet/review candidate**, not a mainnet production deployment. Independent security review remains mandatory before production.


## V14 full mobile testnet launcher

The full production-candidate mobile launcher is published from:

https://hwpb647cs4-source.github.io/Troll-testnet/v14/mobile/

Use Wallet A on Robinhood Chain Testnet (46630), paste Wallet B's **public address only**, then follow:

`Connect → Load V14 Build → Deploy V14 Batch Deployer → Deploy Full V14 Contracts → Run / Resume Full V14 Testnet Proof`

The flow is resumable and verifies the full V14 invariant:
- frozen 5,000 Genesis identity
- NVIDIA family proof
- 175,000 tTROLL burn → ASCENDED
- 2.00x reward weight
- persistent passive bound vault
- tUSD, tGOLD and tSILVER vault accumulation
- regulated tNVDA token-ID entitlement
- A→B ownership transfer with persistence
- V13 evolution-aware metadata
- snapshot provenance anchor

Do not use production keys or real-value assets in this testnet launcher.
