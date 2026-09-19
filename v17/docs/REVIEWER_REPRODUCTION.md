# Reviewer Reproduction Guide

## Clone and select exact target

```bash
git clone https://github.com/hwpb647cs4-source/Troll-testnet.git
cd Troll-testnet
git checkout 5b5b9ce5bfa1d97ee2500234411648f49c11a71f
```

## Build and test

```bash
cd v15
npm install --no-audit --no-fund
npm run validate:static
npm run compile
npm test
```

Expected:
- static invariants: PASS
- Solidity compilation: PASS
- V15 adversarial suite: PASS

## Audit-evidence branch

V17 contains audit-only tooling and does not alter the V15 review source.

The V17 CI:
- verifies `v15/` is byte-for-byte unchanged relative to the frozen commit;
- recompiles V15;
- reruns the adversarial suite;
- generates source/ABI/bytecode SHA-256 hashes;
- uploads the reviewer evidence bundle.

## Network context

Production target:
- Robinhood Chain
- chain ID 4663

Do not use mainnet credentials while reproducing the review. Contract review and tests do not require production keys.
