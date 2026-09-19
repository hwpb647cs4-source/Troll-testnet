# TROLL NFT 2.0 — V45 Holder Safety

V45 adds a human-readable safety layer in front of any future owner-signed transaction flow.

## Before a holder signs
The interface should show:
- exact network/chain ID;
- exact target contract;
- whether the target is known/verified;
- decoded method category when recognized;
- native value being transferred;
- approval/transfer warnings;
- simulation result;
- why the action is needed.

## High-attention actions
Always emphasize:
- global NFT operator approvals;
- ERC-20 approvals;
- NFT/token transfers;
- native-value transfers;
- unknown target contracts;
- wrong-chain requests.

## Wrong chain
A transaction prepared for testnet must not silently be signed on mainnet, or vice versa. Chain mismatch is a hard block.

## Unknown contracts
Unknown does not automatically mean malicious, but the UI must not present an unknown target as trusted.

## Anti-phishing rules
- never ask for a seed phrase/private key;
- never instruct a holder to paste a secret into a website/chat;
- never hide the target contract;
- never disguise an approval as a harmless login;
- never auto-sign;
- never bypass wallet confirmation.

## Agent integration
V30 prepares unsigned steps. V45 is the holder-facing inspection layer before the wallet receives that step.

The intended flow remains:

**agent proposes → policy checks → simulate → holder safety screen → wallet confirmation → owner signs → verify**

V45 does not sign or broadcast transactions.
