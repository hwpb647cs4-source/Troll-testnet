# TROLL Production Safe Multisig Preflight

This is deployment preparation only.

## Canonical Safe support on Robinhood Chain

The official `safe-global/safe-deployments` registry now lists Robinhood Chain mainnet **4663** as a canonical network for Safe v1.4.1 deployments.

Canonical addresses:

- SafeProxyFactory: `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67`
- SafeL2 singleton: `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762`
- CompatibilityFallbackHandler: `0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99`
- MultiSend: `0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526`

Blockscout live checks on chain 4663 confirm the proxy factory, SafeL2 singleton and fallback handler are contracts; the first three are source-verified there. MultiSend code is present through the Safe deployment registry and on-chain contract check, though Blockscout did not expose verified source metadata in the current query.

## Production configuration

Target:
- **2-of-3 Safe**
- three independent signer wallets/devices
- no single signer controls long-term administration

The Safe will become the long-term authority for:
- ADMIN_MULTISIG
- ROYALTY_RECEIVER
- ENTITLEMENT_ADMIN
- SNAPSHOT_PUBLISHER

The deployer remains operationally separate.

## Required human step

Before creating the production Safe, the owner must provide/confirm **three public signer addresses only**.

Never provide:
- seed phrases
- private keys
- mnemonics
- recovery codes

## Gate

The production multisig release gate remains OPEN until:
1. three signer public addresses are independently verified;
2. the 2-of-3 Safe is created on chain 4663;
3. Safe owners and threshold are read back on-chain;
4. the final Safe address is recorded;
5. role-transfer rehearsal passes;
6. long-term roles are transferred after deployment verification.
