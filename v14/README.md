# TROLL NFT 2.0 — V14 Production-Candidate Testnet

V14 turns the successful simplified Robinhood testnet proof into a hardened production-candidate core.

## Frozen product loop

**5,000 permanent Genesis NFTs → burn TROLL → evolve → higher reward weight → approved assets accumulate in the permanent bound vault → NFT transfer preserves identity, burn biography, evolution, vault and accumulated value relationship.**

No NFT burning, sacrifice, extinction, or supply expansion is introduced.

## V14 adds the asset layer without complicating the NFT

- **DIRECT_VAULT lane:** unrestricted approved assets such as stablecoins, gold/silver representations, or other permitted ERC-20 assets can be routed directly into the token-ID-bound passive vault.
- **REGULATED_ENTITLEMENT lane:** stock/tokenized-security-like rewards are recorded as token-ID-bound entitlements instead of pretending every regulated asset can be freely transferred into an NFT wallet.
- Exact chain ID + exact token contract is used for asset identity. Ticker symbols alone are never trusted.
- The protected vault remains passive: no arbitrary `execute()` and no withdrawal method.

## Acceptance test

The V14 CI test performs:

`mint #1 → reveal frozen NVIDIA family → create deterministic vault → burn 175,000 tTROLL → ASCENDED / 2.00x → route tUSD + tGOLD + tSILVER into vault → reject direct tNVDA → record tNVDA entitlement → transfer NFT A→B → verify every identity/evolution/vault/asset state survives`

## Frozen provenance

- Genesis manifest SHA-256: `0x7658b0b924dfa9578a7172798a94ac8f799993ff9f9045fed13022a360adcdbe`
- Family Merkle root: `0x6f1c3a173b47ed7551c72dacbe1a5b69ef2e08dce33c1d8e78eaa627bf76d1a3`
- Genesis supply: **5,000 forever**

## Not production-mainnet ready yet

V14 is a production **candidate** for testnet and review. Mainnet remains blocked on independent security review, final production metadata/CIDs, production mint-controller configuration, treasury/multisig configuration, and verification of the exact permitted assets and regulated-settlement path.
