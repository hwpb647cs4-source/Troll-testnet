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

### IA-01 — HIGH DESIGN RISK — permanent passive-vault custody

**Surface:** `TrollBoundVaultV19`  
**Disposition:** design intent recorded; independent verification and disclosure evidence pending.  
**Release status:** HIGH / TRIAGED in V34; mainnet remains BLOCKED.

The decision is already recorded in [findings.json](./findings.json), introduced on main by
[commit 3d04bd5](https://github.com/hwpb647cs4-source/Troll-testnet/commit/3d04bd57a68f58bb73df2af55a271bccae7b88ba).
PR #44's original OPEN_DECISION text predates that record. This reconciliation preserves that
decision; it does not assert that an independent auditor has approved it.

**Recorded decision:** retain permanent, non-withdrawable NFT-bound accumulation in frozen V19
at `c3750b9458156e962393059f78c92e79802bf622`. Do not add holder withdrawals,
administrator sweeps, token approvals, upgrades, or arbitrary execution as an IA-01 patch.

#### What custody and rewards actually mean

- The vault stores immutable collection/token-ID/factory references. It accepts ERC-721/ERC-1155
  safe transfers and can receive ERC-20 transfers. It implements no asset-out, approval,
  recovery, generic-call, or upgrade function. Neither the holder nor the project administrator
  can extract assets through V19. Ordinary native-currency sends revert.
- Selling/transferring the Genesis NFT changes its owner and preserves the vault address,
  burn history, and evolution by token ID. It grants no redemption right over vault assets.
  A possible secondary sale is not a guaranteed exit, liquidity source, or realizable vault value.
- Anyone can call `depositDirect` using their own approved funds. The router requires an enabled,
  local-chain DIRECT_VAULT asset and measures the actual received ERC-20 amount. These checks
  apply to the router only: direct token transfers and receiver hooks bypass its asset list.
  The permissionless factory can also create vaults for nonexistent token IDs.
- Evolution credits TROLL received at the configured dead address. `rewardWeightBps` exposes
  weights from 1.00x to 5.00x, including 2.00x at ASCENDED. The reward router never reads that
  weight: it implements no budget, eligibility snapshot, allocation formula, recurring payout,
  or guarantee of larger distributions. A funded reward policy remains separate.
- `recordRegulatedEntitlement` is administrator-only cumulative bookkeeping with a latest
  manifest hash and event history. It neither delivers stock tokens to the vault nor executes
  settlement/redemption. A record is not proof of backing, direct share ownership, or an
  automatically transferable legal claim. Settlement remains a separate gate under issue #41.
- “Permanent” describes the absence of a V19 withdrawal path. It does not promise constant
  balances or value: external token mechanics, issuer powers, and market prices remain relevant.
  The vault is not an ordinary spendable wallet or an ERC-6551 execution account.

These conclusions follow from
[the frozen source](https://github.com/hwpb647cs4-source/Troll-testnet/blob/c3750b9458156e962393059f78c92e79802bf622/v19/contracts/TrollProductionCandidateV19.sol).
Epoch funding, eligibility, asset identity, allocation, and settlement evidence belong in
[the reward ledger](../../v28/docs/REWARD_LEDGER.md), with live balances and regulated records kept separate.

#### Alternatives and recommendation

| Option | Security and holder tradeoff | Review consequence |
| --- | --- | --- |
| Retain passive accumulation | Smallest executable attack surface; no holder/admin drain path. Deposits and mistakes are irreversible through V19. | Recommended for the already-recorded product intent; reconcile disclosures and obtain independent verification. Frozen source stays unchanged. |
| Narrow holder withdrawals | Supports redemption. Check current `ownerOf(tokenId)` on every call; initially transfer only to that owner, with typed asset methods, safe transfers, reentrancy protection, and events. No operator/admin authority, approvals, or arbitrary calls. | Preferred starting point if redemption becomes required. New contracts/target, transfer and hostile-token tests, and independent review required. |
| Separate funded reward distributor | Future rewards can be claimable without funding passive vaults. Adds budget, eligibility/ownership-at-claim, epoch, and replay-prevention decisions. | Separate audited scope; cannot recover existing V19 deposits or silently change promised accumulation. |
| Administrator/multisig rescue | Adds an administrator asset-seizure path. A threshold or delay does not preserve the no-withdrawal promise. | Reject as a quick fix; material custody change and new audit target. |
| Generic execution/account | Enables spending, approvals, and application interactions, with substantially broader authorization and callback risks. | Outside the frozen product scope; not a minimal IA-01 remediation. |

This recommendation minimizes changes to the chosen product; it does not make permanent
lockup suitable for holders who require redemption. Withdrawable accounts also need protection
against removing assets before a pending NFT sale. The
[ERC-6551 security considerations](https://eips.ethereum.org/EIPS/eip-6551#security-considerations)
describe that sale risk and ownership cycles.

A concrete V19 residual risk follows from its permissive ERC-721 receiver: sending the
Genesis NFT into its own passive vault can trap the NFT itself. Other NFTs sent to any passive
vault are likewise unrecoverable through V19. This source-derived scenario requires explicit
external assessment; disclosure alone is not proof that every locking scenario is acceptable.
Existing vault deposits cannot be migrated by merely deploying a new factory or withdrawal contract.

#### Holder-facing disclosure

> This NFT is linked to a permanent accumulation vault. Assets sent there cannot be withdrawn,
> redeemed, spent, or recovered through V19 by you or the project. Selling the NFT does not
> unlock them, and a buyer or sale price is not guaranteed. Do not send the Genesis NFT itself
> to a passive vault. Burn-based reward weights do not guarantee funded distributions.
> Regulated records are separate from assets delivered on-chain and require separate settlement.

The custody/reward claims in [V42](../../v42/approved-claims.json) provide source-backed copy.
Before production, show this disclosure at mint, deposit, and Passport/balance surfaces;
distinguish locked balances, regulated records, and historical/reference evidence.
Adding copy to this repository is not proof that a production interface displays it.

#### Evidence required before IA-01 can close

1. Retain this decision's provenance and obtain a named product-owner/maintainer acknowledgement
   of the irreversible custody model and final holder-facing copy.
2. Identify the independent reviewer and bind the report to the exact frozen V19 commit and
   reproduced build. Independently verify the absence of withdrawal, approval, upgrade, or
   administrator recovery paths and assess actual deposit/receiver behavior.
3. Reproduce the relevant ERC-20/ERC-721/ERC-1155 custody and A-to-B persistence cases, and
   explicitly disposition accidental deposits, nonexistent-token vaults, and the Genesis NFT
   self-lock scenario. Request a new reviewed target if a contract fix is required.
4. Attach evidence of the production disclosure surfaces and a reviewer conclusion that the
   HIGH concern is resolved under the documented specification. A design-intent label or an
   automated scanner score cannot close a genuine unresolved HIGH risk.
5. Record reviewer identity, report/evidence references, commit, and disposition in V34.
   Move IA-01 to CLOSED_VERIFIED only when that evidence supports closure; otherwise keep it
   blocking. ACCEPTED_RISK is not permitted for HIGH under V34 policy.

The internal status RESOLVED_DESIGN_INTENT_PENDING_EXTERNAL_VERIFICATION maps to
V34 HIGH / TRIAGED, not CLOSED_VERIFIED. Registering it makes the existing V34 CI release check
fail until verified closure; do not weaken that check or lower severity to obtain a green run.

Closing IA-01 alone does not close the independent human-audit gate, IA-02 through IA-05,
or any production requirement in [issue #41](https://github.com/hwpb647cs4-source/Troll-testnet/issues/41).
No mainnet authorization is supplied by this decision.

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

The frozen V19 target has strong automated/testnet evidence, but this internal review records one **high-impact custody decision pending independent verification** (permanent passive-vault custody) and several privileged configuration/integrity questions that must be resolved before mainnet.

This report does not close the independent-audit gate.
