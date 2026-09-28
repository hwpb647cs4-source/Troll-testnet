# Canonical TROLL — Production Binding

Canonical production TROLL token:

`0x2a13008CC2F5A853F6Fb21cbD90841806C64b247`

## On-chain verification — PASS

Independently checked on Robinhood Chain mainnet, chain ID **4663**, through Blockscout.

Observed:
- contract exists;
- verified source: yes;
- proxy: no;
- verified contract name: `CTOMigrationToken`;
- ERC-20 token name: `Troll in Hood`;
- symbol: `TROLL`;
- decimals: **18**;
- token standard: ERC-20;
- `burn(uint256)` and `burnFrom(address,uint256)` are present in the verified ABI.

The token address shown in the user's live TROLL/ETH market screen matches this exact address.

## V19 production binding

This address belongs in the `troll_` constructor parameter of:

`TrollEvolutionEngineV19`

## Burn semantics

The canonical TROLL token contract is **not** the burn sink.

Frozen V19 currently removes TROLL from circulation by calling `transferFrom` to:

`0x000000000000000000000000000000000000dEaD`

The verified canonical token also exposes native `burn()` / `burnFrom()` functions. Switching V19 from dead-address removal to native supply burn would modify the audited contract behavior and create a new review target, so no such change is made automatically.

## Production status

`CANONICAL_TROLL = ONCHAIN_VERIFIED_BLOCKSCOUT`

No change to the frozen V19 Solidity source is required for the token-address binding.
