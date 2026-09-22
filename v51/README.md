# V51 security remediation candidate — NOT RELEASED

V51 is a separate review target derived from frozen V19 at
`c3750b9458156e962393059f78c92e79802bf622`. V19, its audit evidence, the live testnet
launcher, and the V32 production selection remain unchanged. No deployment or signing
is performed by this directory. Passing local tests does not close independent review.

## Changes

| Finding | Candidate remediation | Remaining disposition |
| --- | --- | --- |
| IA-01 permanent custody | Retain non-withdrawable accumulation; reject Genesis safe transfers in the vault receiver, own predicted-vault destinations in the NFT, and all deployed canonical vault destinations. | Permanent custody still requires explicit disclosure and independent verification. No withdrawal or recovery function added. |
| IA-02 chain semantics | Both direct deposits and regulated records require the local chain ID. | Fail-closed local-chain policy; cross-chain settlement is outside this candidate. |
| IA-03 mutable identity | Registration is append-only for each chain/token key. Decimals, class, lane, and symbol cannot be rewritten. Owner may enable/disable with an event. | Exact initial configuration and production multisig still require verification. |
| IA-04 nonexistent NFTs | Factory creation, deposits, regulated records, and snapshots verify NFT existence. | Admin evidence remains trusted; existence does not prove backing or historical ownership. |
| IA-05 burn wording | Use “sent to the configured dead address / removed from circulation.” | The operation does not call ERC20 supply burn or itself reduce totalSupply. |

The unmodified V19 findings must not be marked fixed merely because V51 exists.
See [candidate findings](findings-register.json) and [review target](review-target.json).
PR #47 separately documents the original permanent-custody decision.

## Custody options and decision

| Option | Benefit | Cost / risk |
| --- | --- | --- |
| Permanent passive accumulation (existing intent, retained here) | Smallest authority surface; no administrator drain path | Irreversible funds; unsuitable if holders expect spendable rewards |
| Narrow holder-only withdrawal | Spendable assets with limited authority | New access-control, ownership-transfer and reentrancy design; fresh audit and deployment required |
| General execution / upgradeable vault | Broad account functionality and recovery choices | Largest authority and attack surface; not a minimal remediation |

The smallest decision is to affirm permanent accumulation with explicit holder disclosure
and auditor acceptance of its exact boundaries. If the product promises redeemable rewards,
reject that decision and commission a narrow holder-withdrawal redesign before deposits.
Do not add an owner sweep as a shortcut. This candidate follows the already documented
permanent-custody intent; it does not establish stakeholder or external-auditor approval.

## Deployment incompatibilities to review

1. Deploy the V51 NFT, then its V51 factory.
2. The NFT owner must call `setVaultFactory(factory)` once, before minting. It checks
   collection identity and cannot be changed afterward. Verify the exact factory bytecode
   first: NFT transfers now depend on its read-only prediction/registry methods.
3. Configure the mint controller, evolution engine, and metadata router with the existing
   one-way freeze procedure. No existing V19 browser artifact deploys this candidate.
4. Deploy the reward router with the V51 factory/registry. It derives its NFT collection
   from the factory. Snapshot-anchor construction now requires `(initialOwner, nft)`.
5. Verify asset identities before registration; a mistake requires a separately reviewed
   registry/router replacement, not silent reinterpretation of an existing key. Disabling
   an asset stops router use but cannot prevent unsolicited direct transfers to vaults.
6. New code changes vault predictions and deployment bytecode. Produce a new exact build,
   constructor/configuration manifest, independent review, and testnet rehearsal before
   considering promotion. Never reuse V19 bytecode evidence as proof of V51 correctness.

Test-only MockAsset, FeeOnTransferAsset, ReentrantMintReceiver, CustodyTestNFT and
CustodyTest1155 contracts must never be selected as production components.

## Custody limitations that still apply

Assets deposited into passive vaults cannot be withdrawn, spent, redeemed, or recovered
through these contracts by holders or administrators. NFT resale does not unlock assets
or guarantee a buyer, price, or economic redemption. Existing V19 deposits cannot be
rescued by deploying V51. This is not an upgrade or migration.

The NFT guards block its own canonical predicted vault and every already-deployed
canonical vault, for both safe and unsafe transfers. They do not identify every arbitrary
contract or an *other token's* not-yet-deployed predicted vault. Unsafe transfers to
such addresses can still trap NFTs. The collection receiver guard additionally rejects
safe Genesis transfers into separately deployed instances of the passive vault.
External reviewers must assess these boundaries; interfaces must reject known passive
vault destinations, including predictions for other IDs. No claim of universal lock
prevention is made. Unsolicited unrelated ERC20/ERC721/ERC1155 deposits remain possible.

Holder copy required at mint, deposit and Passport surfaces:

> This NFT is linked to a permanent accumulation vault. Assets sent there cannot be
> withdrawn, redeemed, spent, or recovered through the collection contracts by you or
> the project. Do not send Genesis NFTs into passive vaults. Selling the NFT does not
> unlock vault assets. Reward weights do not guarantee funded distributions. Regulated
> records require separate settlement and are not proof of delivered stock tokens.

This file supplies copy; it does not assert that a production interface displays it.

## Reward allocation policy and runnable planner

Run `node rewards/plan.mjs rewards/example-input.json` after dependency installation.
The example uses synthetic addresses and balances on testnet; it is not funding evidence.

- One epoch contains one exact chain/asset/decimals identity and DIRECT_VAULT lane.
  Never pool different assets, chains, or regulated records into one budget.
- Publish the funding source and budget before execution. Use only independently verified,
  available treasury tokens after subtracting all commitments, with separate gas funds.
  Unreceived mint revenue, forecast royalties, and burned TROLL are not funding.
- Take a complete snapshot of minted IDs 1..totalSupply at one finalized block/hash.
  Read cumulative TROLL removal and family data at that block; independently verify the
  source against the reviewed collection and evolution contract. The offline planner
  validates shape/completeness but does not fetch chain data or prove supplied balances.
- An epoch either covers all minted NFTs (`family_filter: null`) or one explicitly
  published family. Family-filtered epochs require all snapshot families revealed, so
  default/unrevealed family zero cannot masquerade as eligibility. Freeze this choice
  with the epoch manifest before transfers; the planner does not establish legal eligibility.
- Derive weights from the existing burn thresholds: 1.00x, 1.10x, 1.25x, 1.50x, 2.00x,
  3.00x, 5.00x. Allocation is `floor(budget_raw * weight / sum_eligible_weights)`.
  Integer dust remains unallocated in treasury and is disclosed. Zero allocations are skipped.
- A 2x weight receives twice a 1x weight's gross allocation in the same funded epoch,
  subject to integer rounding. It does not promise twice a dollar payout across epochs.
- Allocation follows token ID into the persistent vault even if the NFT changes owner
  after the snapshot. Later burns affect later epochs only. Family affinity alone is not
  ownership of the corresponding company or an entitlement to a funded distribution.
- The output is a hashed proposal with `NOT_EXECUTED` / `NO_RECEIPTS`, not a transaction
  sender, funding attestation, or automatic reward engine. Its hash commits to the
  normalized snapshot, exact asset, budget, funding reference, and allocations.
- Before signing, independently verify snapshot provenance, current treasury funds,
  registry configuration, destination vaults, and the exact manifest. Execute approved
  transfers through `depositDirect`; retain each receipt and actual credited amount.
  Fees can make received rewards smaller than gross allocations. Never label the proposal
  or requested amounts as actual delivered balances.
- Maintain an execution journal keyed by chain/collection/epoch/asset/token ID with
  transaction hashes and confirmed status. Resolve pending/failed transactions before
  retrying. The existing permissionless router has no epoch replay protection; this
  planner must not be connected to unattended signing. Automation requires a separately
  reviewed execution/idempotency mechanism.
- Regulated stock records are explicitly rejected by this planner. Approved custody,
  eligibility, evidence of backing, and settlement remain a separate production gate.

## Validation and release boundary

`npm ci --no-audit --no-fund && npm test` compiles with pinned Solidity 0.8.24,
runs adapted V19 lifecycle/fee/callback regressions, targeted remediation tests, and
exact-integer reward tests. The lockfile pins the dependency tree.

CI preserves frozen V19, reruns this suite and Slither, and rejects High/Medium scanner
findings without changing any V32 gate. Source/build hashes are generated for review.
Independent human review, target promotion, production multisig, metadata, exact assets,
settlement approval, infrastructure, final rehearsal and owner authorization remain open.
No mainnet release is authorized by this candidate.

Local validation: 12 contract tests and 5 planner tests pass. Slither 0.11.6 reports
0 High, 0 Medium, 3 Low and 6 Informational findings. See
[validation summary](validation-summary.json) for dispositions and limitations.
Two Low findings concern read-only factory calls in the mint loop; the third concerns
the deliberately reentrant test receiver. None are suppressed or declared independently
verified. CI results must be checked separately after the PR runs.
