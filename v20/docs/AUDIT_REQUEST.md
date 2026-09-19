# Independent Security Review Request — V19

## Exact review target

`c3750b9458156e962393059f78c92e79802bf622`

Primary Solidity source:

`v19/contracts/TrollProductionCandidateV19.sol`

Primary regression/security suite:

`v19/test/v19.remediation.test.cjs`

## Toolchain

- Solidity 0.8.24
- OpenZeppelin 5.1.0
- Hardhat 2.22.13
- Slither 0.11.6
- Target network: Robinhood Chain, chain ID 4663

## Automated evidence already passed

- V14 full lifecycle regression: PASS
- V15 hardening regression: PASS
- V16 production rehearsal: PASS
- V17 evidence/audit freeze infrastructure: PASS
- V19 focused remediation tests: PASS
- V19 full lifecycle test: PASS
- Slither High: **0**
- Slither Medium: **0**
- Slither Low: **1**
- Slither Informational: **6**

Slither artifact digest:

`sha256:0091d23313d9a606d2cf57c114ee22bf8245aa06e12a070d2b45154a1a1db774`

Automated evidence is not an audit substitute.

## Requested manual review focus

1. ERC-721 mint path and safe-mint callback behavior
2. token-ID range reservation and reentrancy assumptions
3. 5,000 permanent supply cap
4. SHA-256 family Merkle proof encoding
5. CREATE2 passive vault derivation
6. passive vault custody model and asset-recovery assumptions
7. TROLL burn accounting
8. non-standard ERC-20 reward behavior
9. exact-chain/exact-contract asset registry
10. DIRECT_VAULT vs REGULATED_ENTITLEMENT separation
11. entitlement admin/ownership risk
12. metadata routing integrity
13. snapshot provenance model
14. Ownable2Step operational risks
15. deployment-order/misconfiguration risk
16. denial-of-service / griefing vectors

## V19 remediations requiring specific review

### SLI-001
V15 passive vault accepted ETH but had no withdrawal path.

V19 remediation:
- removes native ETH receive path;
- direct ETH transfers revert;
- ERC-20/ERC-721/ERC-1155 custody remains supported.

### SLI-002
V15 wrote project timestamp state after `_safeMint` receiver callbacks.

V19 remediation:
- `mintFromController` is `nonReentrant`;
- complete token-ID range is reserved before callbacks;
- timestamps are written before callbacks;
- malicious receiver regression attempts recursive minting.

## Required report

Every finding should include:
- ID
- severity
- affected function/contract
- exploit preconditions
- proof/reproduction
- impact
- remediation
- ABI/storage/semantic impact
- final disposition

The final report must state the exact reviewed commit hash.
