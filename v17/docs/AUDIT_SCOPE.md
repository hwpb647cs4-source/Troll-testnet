# TROLL NFT 2.0 — V17 Audit Freeze

V17 freezes the security-review scope. It does **not** change the V15 product logic.

## Exact review target

`5b5b9ce5bfa1d97ee2500234411648f49c11a71f`

Primary source:

`v15/contracts/TrollProductionCandidateV15.sol`

Security regression test:

`v15/test/v15.security-hardening.test.cjs`

## In scope

- Genesis ERC-721 ownership and 5,000 supply cap
- frozen family SHA-256 Merkle proof
- TROLL burn/evolution accounting
- deterministic passive CREATE2 vault
- direct-vault reward routing
- exact chain ID + contract asset identity
- regulated entitlement lane
- metadata routing
- collection/passport lens
- snapshot provenance anchor
- ownership/admin/freeze controls
- non-standard ERC-20 behavior
- deployment-order/misconfiguration risks

## Out of scope

- expected NFT price appreciation
- issuer solvency
- tokenized-security legal eligibility
- marketplace behavior
- artwork/IP review
- oracle/market-price systems not present in V15

## Evidence already available

- V14 full Robinhood testnet proof: PASS
- V15 compile: PASS
- V15 static security invariants: PASS
- V15 adversarial test suite: PASS
- V16 no-broadcast production rehearsal: PASS

These do not replace independent review.

## Freeze rule

Any source-code change after the audit begins creates a **new audit target**. No finding may be silently fixed and still represented as the reviewed commit.
