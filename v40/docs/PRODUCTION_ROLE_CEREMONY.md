# TROLL NFT 2.0 — V40 Production Role Ceremony

V40 prepares the human-controlled production role setup without creating wallets or collecting secrets.

## Roles to verify
- deployer;
- admin multisig;
- mint controller;
- royalty receiver;
- regulated-entitlement admin;
- snapshot publisher.

## Ceremony
For every production address:
1. create/configure it outside the repository using the chosen hardware-backed wallet/multisig process;
2. independently read the public address on at least two trusted displays/sources;
3. record only the public address;
4. record an evidence reference;
5. verify Robinhood Chain mainnet chain ID = 4663;
6. confirm the admin is a multisig with threshold >= 2;
7. rehearse ownership transfer using testnet/local deployment first;
8. only then mark the role VERIFIED.

## Never store
- private keys;
- seed phrases;
- mnemonics;
- recovery codes;
- hardware-wallet secrets.

## Separation
The deployer should be operationally separable from long-term administration. The deployment wallet should not silently become the permanent treasury/admin authority.

## Current gate
**PRODUCTION_MULTISIG = OPEN**

V40 provides validation and ceremony documentation only. It does not create accounts, sign transactions, or close the release gate.
