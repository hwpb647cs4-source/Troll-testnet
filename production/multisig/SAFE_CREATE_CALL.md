# Production Safe creation call — ready

Target network: Robinhood Chain mainnet, chain ID **4663**.

The owner-confirmed signer set is:

1. `0x745B9B869900B2D8c2742DD9361Cba88EB133c15`
2. `0xdc2f1175f73e474f673717bc91583865cb3db074`
3. `0xaaa6a3c51a7fcca64348951cadda1f671144b64c`

Threshold: **2 of 3**.

Canonical Safe v1.4.1 components:
- SafeProxyFactory: `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67`
- SafeL2 singleton: `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762`
- CompatibilityFallbackHandler: `0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99`

Prepared factory call:
- method: `createProxyWithNonce(address,bytes,uint256)`
- singleton: see JSON
- initializer: see JSON
- salt nonce: `202609282250`

This repository does not contain or request any private key.

## Before signing

The transaction-sending wallet must:
- be on Robinhood Chain mainnet (4663);
- hold enough ETH for gas;
- verify the factory address exactly.

## After signing

Record the transaction hash, then verify on-chain:
- Safe contract code exists;
- owners match the three addresses above;
- threshold equals 2.

Only then can `PRODUCTION_MULTISIG` advance to PASS.
