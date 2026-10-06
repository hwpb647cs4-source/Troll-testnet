# Production Safe creation call — PRIVACY HOLD

Target network: Robinhood Chain mainnet, chain ID **4663**.

## Current state

The previously published signer set and Safe creation payload are **SUPERSEDED — DO NOT SIGN**.

A replacement set of three project-only signer wallets has been confirmed privately by the owner:
- owner count: **3**
- threshold: **2 of 3**
- independent recovery phrases: owner-confirmed
- public addresses intentionally withheld from this repository before deployment

The private preparation uses Safe v1.4.1 and the chain-specific factory method:

`createChainSpecificProxyWithNonce(address,bytes,uint256)`

This includes the chain ID in the CREATE2 salt and avoids replaying the same Safe creation to the same address on another network.

## Public canonical components

- SafeProxyFactory: `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67`
- SafeL2 singleton: `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762`
- CompatibilityFallbackHandler: `0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99`

## Execution rule

No executable replacement payload is stored in the public repository before deployment.

Before any signature:
1. privately review the three exact owners;
2. confirm threshold 2;
3. confirm chain ID 4663;
4. simulate/static-call the exact factory calldata;
5. review predicted Safe address and gas;
6. renew explicit mainnet authorization for those exact inputs.

After deployment, read back owners and threshold on-chain before closing `PRODUCTION_MULTISIG`.
