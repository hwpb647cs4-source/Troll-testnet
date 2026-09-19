# TROLL NFT 2.0 — V46 Privacy & Data Minimization

TROLL is blockchain-native, but that does not mean every piece of user information belongs in the product.

## Public by design
Protocol facts that are already public/on-chain may be displayed:
- token ID;
- family;
- evolution state;
- reward weight;
- token-bound vault;
- evidence-backed stamps;
- proof hashes;
- as-of block.

## Conditional display
Wallet addresses, holder-since dates, transfer counts, asset rows and entitlement rows may be useful, but interfaces should expose them only when necessary for the requested view.

## Never collect for normal operation
- seed phrase;
- private key;
- mnemonic;
- recovery codes;
- precise location;
- device identifiers;
- personal email/phone/legal name unless a separate business/legal workflow genuinely requires them.

## Analytics
Prefer aggregate metrics over user-level behavioral profiles.

## Logs
Security logs should retain only what is operationally necessary. Do not copy wallet secrets or unrelated personal data into logs, issues, proof bundles or grant evidence.

## Noncustodial principle
The easiest secret to protect is one the system never receives.

## V46 boundary
No Solidity, no wallet connection, no signing and no transaction capability.
