# Behavior Engine v0.1 — Troll proving ground

Experimental branch only. This module does **not** modify the audit-frozen V19 production candidate and is not approved for mainnet.

## Security model
PRECOMMIT -> ACT -> RESOLVE -> LOCK -> PROVENANCE.

- rule/version hash committed before action resolution
- per-token monotonic nonce
- global evidence replay protection
- cumulative burn cannot decrease
- reveal must match the prior commitment
- entropy can choose among behavioral/visual branches but cannot change Troll evolution strength
- no custody, minting, token transfers, production keys, or mainnet broadcast

## Troll invariant
Evolution strength remains strictly a function of cumulative verified TROLL burn. Branching creates differentiated behavior/art outcomes without allowing randomness to manufacture a stronger evolution tier.

## Next gates
1. compile + unit tests in CI/local Hardhat
2. fuzz/property tests for replay, phase ordering, monotonic burn and provenance
3. verified burn adapter
4. integration against a copy/harness of the frozen core
5. independent review before any production integration
