# V15 Production Security Gate

## Contract invariants
- [ ] Genesis supply is exactly 5,000.
- [ ] No NFT burn/sacrifice/extinction path exists.
- [ ] Family Merkle root and Genesis SHA-256 match frozen provenance.
- [ ] Core addresses can be frozen and cannot be changed after freeze.
- [ ] Bound vault has no arbitrary execute/withdraw surface.
- [ ] TROLL evolution credits actual dead-address balance delta.
- [ ] Direct rewards credit actual bound-vault balance delta.
- [ ] Every asset identity is exact chain ID + exact contract address.
- [ ] STOCK/regulated assets cannot use DIRECT_VAULT lane.
- [ ] Regulated entitlements are token-ID-bound and survive NFT transfer.
- [ ] Snapshot block cannot be in the future.
- [ ] Metadata state remains consistent with on-chain evolution.

## Operational gates
- [ ] Production deployer is a hardware-backed multisig, not a personal hot wallet.
- [ ] Mint controller role and freeze plan are documented.
- [ ] Asset registry changes require controlled governance.
- [ ] Treasury funding limits and incident response are documented.
- [ ] Production contract addresses are independently verified after deployment.
- [ ] Explorer source verification succeeds.
- [ ] Independent security reviewer signs off on exact commit.
- [ ] Mainnet rehearsal reproduces the full V14/V15 testnet lifecycle.

No mainnet deployment until every item is closed.
