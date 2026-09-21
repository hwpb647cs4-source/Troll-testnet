# TROLL NFT 2.0 — Internal V19 Security Review

## Scope

Exact frozen target:

`c3750b9458156e962393059f78c92e79802bf622`

Primary contract:

`v19/contracts/TrollProductionCandidateV19.sol`

This is an **internal review**, not an independent third-party audit.

## Evidence already passed

- full local lifecycle regression;
- access-control negative tests;
- malicious safe-mint callback/reentrancy regression;
- fee-on-transfer accounting regression;
- wrong-chain direct-asset rejection;
- regulated-lane/direct-lane separation;
- snapshot future-block rejection;
- Slither baseline: 0 High / 0 Medium after V19 remediation;
- final Robinhood Chain Testnet 46630 deployment rehearsal;
- A→B persistence verification.

## Manual review findings

### IA-01 — HIGH DESIGN RISK — passive vault assets have no withdrawal/execution path

**Surface:** `TrollBoundVaultV19`

The V19 bound vault implements ERC-721/ERC-1155 receiver hooks but no owner-controlled ERC-20/ERC-721/ERC-1155 transfer or generic execution function.

Consequences if real assets are deposited:
- ERC-20 assets remain held by the vault indefinitely;
- NFTs/ERC-1155 assets accepted by the vault have no V19 withdrawal path;
- value can move economically with sale of the controlling NFT, but the underlying assets cannot be redeemed or transferred by the NFT holder through V19.

This may be intentional for a permanent accumulation vault, but it must be treated as a **product/economic design decision**, not described as an ordinary spendable wallet.

**Mainnet disposition required:** choose one:
1. explicitly keep the vault permanently non-withdrawable and disclose this property; or
2. design a separately audited owner-authorized execution/withdrawal mechanism, which would create a new audit target and invalidate the current frozen V19 release target.

No code change is recommended automatically.

### IA-02 — MEDIUM CONFIGURATION RISK — regulated entitlement path does not enforce local chain ID

**Surface:** `TrollRewardRouterV19.recordRegulatedEntitlement`

`depositDirect` requires `a.chainId == block.chainid`. The regulated-entitlement function validates enabled status and lane, but does not perform the same chain-ID check.

Because the function is owner-only, this is primarily a privileged misconfiguration risk rather than an untrusted-user exploit. A wrong-chain registry entry could nevertheless be used to record an entitlement on the current deployment.

**Disposition:** external auditor should assess whether regulated entitlements are intentionally cross-chain. If they are local-chain only, add the same chain-ID invariant and re-review the changed target.

### IA-03 — MEDIUM INTEGRITY / ADMIN RISK — asset registry entries are overwriteable

**Surface:** `TrollAssetRegistryV19._registerAsset`

The key is deterministic from chain ID + token address, but the owner can overwrite decimals, class, lane, enabled state and symbol for an existing key.

This is operationally useful but means historical interpretation of a key depends on registry history and admin integrity.

**Disposition:** production multisig + event-indexed registry history are mandatory. External auditor should assess whether a one-way freeze/versioning mechanism is preferable before mainnet.

### IA-04 — LOW / DATA-INTEGRITY — entitlement and snapshot records do not require an existing NFT

`recordRegulatedEntitlement` and `publish` can write records for arbitrary token IDs when called by their privileged owner.

This does not transfer assets and is privileged, but operational mistakes could create evidence for nonexistent/future token IDs.

**Disposition:** enforce operational validation off-chain, or add on-chain existence checks only if the external review considers the extra coupling worthwhile.

### IA-05 — INFORMATIONAL — “burn” is transfer-to-dead-address accounting

Evolution sends TROLL to the configured immutable dead address and credits the actual balance increase there. It does not call an ERC-20 burn function and therefore does not itself reduce ERC-20 `totalSupply()`.

Product language should say **permanently removed from circulation / sent to the configured dead address** unless the underlying TROLL token separately treats that transfer as supply burn.

## Positive observations

- core NFT configuration can be one-way frozen;
- mint path is reentrancy-protected and reserves state before safe-mint callback;
- evolution checks current NFT ownership;
- evolution credits actual received amount;
- direct reward path credits actual vault balance delta;
- direct deposits enforce enabled asset, local chain and direct-vault lane;
- regulated entitlements are separated from direct vault assets;
- privileged contracts use OpenZeppelin ownership patterns;
- snapshot anchor rejects future blocks;
- vault rejects native ETH;
- A→B transfer preserves evolution/vault state by token ID.

## Internal conclusion

The frozen V19 target has strong automated/testnet evidence, but this internal review identifies one **high-impact design question** (permanent passive-vault custody) and several privileged configuration/integrity questions that should be explicitly resolved before mainnet.

This report does not close the independent-audit gate.
