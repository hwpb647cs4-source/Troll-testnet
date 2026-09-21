# V19 Five-Pass Internal Audit Matrix

Exact target: `c3750b9458156e962393059f78c92e79802bf622`

Each pass is intentionally different. They are sequential review passes by the same internal team/tooling, **not five independent auditors**.

## Pass 1 — Access control & configuration

Review:
- NFT owner privileges
- mint controller
- evolution-engine callback authority
- registry owner
- reward-router owner
- snapshot publisher
- one-way core freezes
- ownership-transfer assumptions

Focus: unauthorized mint/configuration, frozen configuration bypass, privileged misconfiguration.

## Pass 2 — Asset accounting & economic invariants

Review:
- actual-credit accounting for fee-on-transfer tokens
- dead-address burn accounting
- direct-vault lane vs regulated entitlement lane
- wrong-chain handling
- decimals/class/symbol registry semantics
- cumulative entitlement accounting
- passive-vault custody semantics

Focus: accounting inflation, wrong asset, wrong lane, misleading “burn,” trapped assets.

## Pass 3 — Reentrancy, callbacks & hostile token/NFT behavior

Review:
- safeMint callback
- ERC-20 transfer callbacks/nonstandard behavior
- vault ERC-721/ERC-1155 receivers
- state-before-external-call ordering
- reentrancy guards
- malicious recipient/token assumptions

Focus: recursive mint/evolve/deposit, callback state corruption, griefing.

## Pass 4 — State persistence, metadata & evidence integrity

Review:
- token-ID persistence through transfer
- family proof one-time reveal
- holderSince semantics
- evolution persistence
- vault persistence
- metadata router dependency
- entitlement/snapshot evidence
- nonexistent/future token IDs
- registry-history interpretation

Focus: state corruption, false Passport/evidence state, mutable interpretation.

## Pass 5 — Deployment/admin failure & mainnet threat model

Review:
- constructor parameters
- chain IDs
- frozen addresses
- role handoff/multisig
- registry overwrite power
- entitlement publisher compromise
- snapshot publisher compromise
- metadata availability
- emergency/incident limitations
- permanent passive-vault decision

Focus: mistakes or compromise after otherwise-correct code deployment.

## Required output

Every pass must:
1. run against the same frozen V19 target;
2. preserve previous findings;
3. add only evidence-backed new findings;
4. rerun static + regression + adversarial invariant tests;
5. keep mainnet blocked while High/Medium findings or design decisions remain unresolved.
