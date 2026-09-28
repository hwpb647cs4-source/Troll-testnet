# Callisto / Ethereum Commonwealth — Free Human Audit Request Draft

Target external repository:
https://github.com/EthereumCommonwealth/Auditing/issues/new

## Audit request

TROLL NFT 2.0 is a 5,000-supply ERC-721 system for Robinhood Chain with:
- permanent NFT identity and family metadata;
- burn-driven evolution using a canonical TROLL ERC-20;
- deterministic NFT-bound passive accumulation vaults;
- direct-asset and regulated-entitlement lanes;
- metadata routing, Lens/passport reads, and snapshot anchoring.

The contract candidate is frozen for deployment review. No new product features are being added before launch readiness.

Important intended design assumption:
- the bound vault is intentionally **permanent and non-withdrawable**; it is an accumulation vault, not a spendable holder wallet.

## Source code

Repository:
https://github.com/hwpb647cs4-source/Troll-testnet

Exact frozen audit target commit:
`c3750b9458156e962393059f78c92e79802bf622`

Primary Solidity source:
https://github.com/hwpb647cs4-source/Troll-testnet/blob/c3750b9458156e962393059f78c92e79802bf622/v19/contracts/TrollProductionCandidateV19.sol

Tests:
https://github.com/hwpb647cs4-source/Troll-testnet/tree/c3750b9458156e962393059f78c92e79802bf622/v19/test

## Payment plan

Requesting a **free-of-charge audit** under the repository README's free audit process for open-source contracts.

- [ ] Standard paid plan
- [ ] Advanced paid plan
- [ ] Corporate paid plan
- [x] Free-of-charge audit request

We understand free requests may be queued/lower priority.

## Existing security evidence

- frozen source target;
- Slither 0 High / 0 Medium after remediation;
- five sequential internal audit passes completed;
- full Robinhood Chain Testnet deployment/lifecycle PASS;
- A→B NFT transfer persistence PASS;
- external automated Blockhertz review reported LOW RISK; visible findings reconciled.

Please treat these only as supporting evidence, not as a substitute for your independent manual review.

## Requested review focus

Please pay particular attention to:
1. access control / privileged roles;
2. mint callback/reentrancy behavior;
3. burn/evolution accounting;
4. fee-on-transfer/non-standard ERC-20 handling;
5. CREATE2 vault derivation and passive permanent-custody semantics;
6. direct-vault vs regulated-entitlement lane separation;
7. asset registry mutability/configuration;
8. entitlement manifest semantics;
9. metadata/state persistence through NFT transfer;
10. deployment and admin misconfiguration risks.

## Disclosure policy

Standard disclosure policy is acceptable:
https://github.com/EthereumCommonwealth/Auditing/blob/master/Standard_disclosure_policy.md

If a Critical/High issue is found before publication, please notify through the audit request issue first so remediation can be coordinated before broad disclosure.

## Contact information

Primary project contact can be handled through:
https://github.com/hwpb647cs4-source/Troll-testnet/issues

## Platform

Target network: **Robinhood Chain mainnet**, EVM-compatible, chain ID **4663**.

No mainnet production deployment has been authorized yet.
