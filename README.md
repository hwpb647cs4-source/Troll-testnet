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


## V14 full testnet proof: PASS

**2026-09-18 — PASS**

The full production-candidate V14 path has now passed on Robinhood Chain Testnet.

All 17 acceptance gates were green, including:
- frozen Genesis identity and NVIDIA family proof
- 175,000 tTROLL burn → ASCENDED
- 2.00x reward weight
- persistent passive vault
- 1,000 tUSD + 0.1 tGOLD + 2.5 tSILVER in the vault
- 5.0 tNVDA regulated entitlement
- successful ownership transfer from Wallet A to Wallet B
- preserved collection burn/state/metadata/snapshot provenance

See [V14_FULL_TESTNET_PROOF.md](./V14_FULL_TESTNET_PROOF.md).

The next gate is security review and production configuration, not more feature expansion.


## V19 / V20 security milestone

**V19 remediation: PASS**
- original V15 Slither Medium `locked-ether` finding remediated by rejecting direct native ETH in the passive vault;
- original V15 Slither Medium `reentrancy-no-eth` finding remediated with nonReentrant minting, pre-callback token-range reservation, and pre-callback timestamp state;
- malicious safe-mint receiver regression: PASS;
- full lifecycle/security regression: PASS;
- Slither 0.11.6: **High 0 / Medium 0 / Low 1 / Informational 6**.

**V20 audit freeze: PASS**
- exact independent-review target: `c3750b9458156e962393059f78c92e79802bf622`;
- reproducible source/ABI/bytecode manifest generated;
- V19 Slither baseline revalidated;
- audit evidence artifact generated;
- mainnet remains explicitly blocked pending independent review.

Release blocker: [GitHub Issue #7](../../issues/7)

No new core product mechanics should be added before review closes.
