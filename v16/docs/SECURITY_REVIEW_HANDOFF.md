# TROLL NFT 2.0 — Independent Security Review Handoff

## Review target

Exact V15 merge commit:

`5b5b9ce5bfa1d97ee2500234411648f49c11a71f`

Do not audit "latest main". Audit the exact commit above, then reconcile any later delta separately.

## Proven before audit

The project has already completed:
- simplified end-to-end Robinhood Chain Testnet proof;
- full V14 production-candidate Robinhood Chain Testnet proof;
- V14 CI compile/lifecycle/asset-lane tests;
- V15 static security invariants;
- V15 adversarial tests including access control, invalid family proof, duplicate vault rejection, wrong-chain asset rejection, regulated-lane separation, fee-on-transfer accounting, future-block snapshot rejection, and A→B persistence.

These tests are evidence, not an audit substitute.

## Highest-priority review surfaces

1. ERC-721 ownership and holder-state behavior.
2. Frozen core configuration and role ownership.
3. SHA-256 family proof construction and leaf encoding.
4. Passive vault CREATE2 address derivation and inability to execute/withdraw.
5. Evolution accounting around non-standard ERC-20 behavior.
6. Direct-vault reward accounting and token edge cases.
7. Exact chain/contract asset identity.
8. Regulated entitlement authorization and accounting.
9. Metadata router integrity and state consistency.
10. Snapshot provenance trust model.
11. Ownable2Step transfer/renunciation operational risks.
12. Deployment-order and misconfiguration risks.

## Explicit non-goals

The reviewer is not asked to validate:
- investment returns or NFT market value;
- legal availability of tokenized securities;
- third-party asset issuer solvency;
- metadata artwork rights.

Those are separate business/legal gates.

## Required deliverable

For each issue:
- severity;
- affected contract/function;
- exploit/precondition;
- concrete reproduction;
- remediation;
- whether fix changes storage/API semantics.

A clean review must identify the exact reviewed commit hash.
