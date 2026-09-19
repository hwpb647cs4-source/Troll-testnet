# V16 Production Deployment Rehearsal

V16 is a **no-broadcast production preparation stage**.

The target network is Robinhood Chain mainnet, chain ID **4663**. Production configuration must use a dedicated provider endpoint via `RH_RPC_URL`; the public RPC may be used for low-volume checks but should not be treated as production-grade infrastructure.

## Rehearsal sequence

1. Freeze the exact audited commit.
2. Fill production role addresses using hardware-backed/multisig-controlled accounts.
3. Freeze production metadata CIDs.
4. Build the exact asset allowlist using chain ID + contract address; never symbol-only identity.
5. Rehearse deterministic deployment on a local chain/fork.
6. Record bytecode hashes, constructor arguments, predicted/actual addresses and ownership.
7. Rehearse source verification against Blockscout.
8. Rehearse role transfer to the final multisig.
9. Re-run the V14/V15 lifecycle after deployment.
10. Produce a signed deployment manifest.
11. Only after independent review and explicit final authorization may a mainnet broadcast be prepared.

## Stop conditions

Do not broadcast if any of these are unresolved:
- audit finding;
- placeholder address;
- unverified asset contract;
- unfrozen metadata;
- deployer/admin role ambiguity;
- failed explorer source verification;
- mismatch between compiled bytecode and reviewed commit;
- regulated asset settlement uncertainty.
