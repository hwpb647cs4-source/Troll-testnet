# V14 Acceptance Gates

A V14 candidate passes only if all of these are green:

1. Solidity 0.8.24 compiles with pinned OpenZeppelin 5.1.0.
2. Genesis supply cap remains exactly 5,000.
3. Frozen Genesis SHA-256 and family Merkle root match V4/V11.
4. Token #1 resolves to NVIDIA through the frozen SHA-256 Merkle proof.
5. 175,000 cumulative TROLL burn produces ASCENDED and 20,000 bps reward weight.
6. Bound vault is deterministic and has no arbitrary execute/withdraw surface.
7. Approved direct assets accumulate in the same vault.
8. A regulated STOCK-class asset cannot enter through the direct lane.
9. The regulated entitlement remains token-ID-bound across NFT ownership transfer.
10. Family, burn total, evolution state, reward weight, vault address and direct-asset balances remain unchanged after A→B transfer.
11. V13-style metadata path follows current evolution state.
12. Asset snapshot anchor is provenance-only and holds no assets.

Agent control remains an optional additive layer after the core V14 acceptance path passes; it is not allowed to weaken the protected-vault invariant.
