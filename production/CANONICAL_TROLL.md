# Canonical TROLL — Production Binding

User-designated canonical TROLL token contract:

`0x2a13008CC2F5A853F6Fb21cbD90841806C64b247`

## How V19 uses it

This address belongs in the `troll_` constructor parameter of:

`TrollEvolutionEngineV19`

The evolution engine then transfers that ERC-20 from the NFT owner to the configured burn sink when `evolve()` executes.

## Important distinction

**Canonical TROLL token contract**
`0x2a13008CC2F5A853F6Fb21cbD90841806C64b247`

is **not** the burn sink.

The current V19 burn sink remains:

`0x000000000000000000000000000000000000dEaD`

unless the user separately authorizes a different burn destination.

## Production gate

The address is now frozen as the user-designated canonical TROLL address for production configuration.

Before mainnet broadcast we still verify on chain 4663:
- contract code exists;
- ERC-20 interface/decimals/symbol behavior;
- expected token identity;
- no proxy/upgrade surprise that invalidates assumptions;
- transfer behavior is compatible with V19 actual-credit accounting.

Until those checks pass, the release manifest should describe this as:

`USER_CONFIRMED_CANONICAL_TROLL / PENDING_ONCHAIN_CONTRACT_VERIFICATION`

No change to the frozen V19 Solidity source is required.
