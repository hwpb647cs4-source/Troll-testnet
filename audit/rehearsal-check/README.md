# Frozen V19 testnet evidence recheck — 2026-09-23

## Scope and result

The user authorized continued testnet/rehearsal work, not mainnet. PR #43 already records a completed testnet lifecycle and A-to-B NFT transfer. Issue #41's original unchecked rehearsal entry and its later completion comments must not be treated as identical evidence. Do not ask for a duplicate deployment merely because that checkbox is stale.

A fresh, local format/consistency check found one concrete defect in `deploy/v19-testnet/FINAL_REHEARSAL_PROOF.json`: `contracts.TrollInHoodGenesisV19` contains 41 hexadecimal digits after `0x`, rather than 40. The original record is retained unchanged; this checker does not truncate, pad, guess, or auto-repair addresses.

Source blob checked: `f7cbca5d838f10fed2af76d7d26add098c4a03ce`.

Source bytes SHA-256: `c9eb051bd147d642132e2a489912ea73c52cafaea77d13c405ddca431de9358b`.

Local validation executed on 2026-09-23: all 16 checker unit tests passed. These are evidence-checker tests with mocked RPC responses, NOT new V19 Solidity regression results and NOT live-chain proof. The actual historical JSON is rejected with exit code 1 (`invalid_nonzero_evm_address`, width 41). Its embedded `status: PASS` is only a historical claim.

## Commands

```sh
python3 -m unittest discover -s audit/rehearsal-check -p 'test_*.py' -v
python3 audit/rehearsal-check/validate_proof.py deploy/v19-testnet/FINAL_REHEARSAL_PROOF.json --output proof-check.json
python3 audit/rehearsal-check/validate_proof.py deploy/v19-testnet/FINAL_REHEARSAL_PROOF.json --rpc-read --output proof-check-live.json
```

The optional live command uses only a fixed official testnet RPC and allowlisted read methods. It checks chain 46630, transaction/receipt consistency, a canonical-at-lookup block, the exact NFT transfer event, and runtime-code presence at that block. It reports the observed destination but never changes the original record. Network failure is UNVERIFIED and exits nonzero. Any format or receipt mismatch remains blocking.

The dedicated CI workflow separately reruns the frozen V19 source comparison, static checks, compilation, and existing local Hardhat regression suite. No signing key, wallet, transaction broadcaster, production network, or deployment job is used. Do not describe CI as passed until its actual jobs complete.

## Required next evidence

Recover the correct Genesis address from the exact transfer receipt and original deployment receipts; verify the deployed build and constructor/core configuration independently before correcting the historical proof in a reviewed change. Never delete a character to make the address look valid. One public RPC receipt is not a complete audit, build-hash match, current-state proof, or finality guarantee.

A-to-B NFT ownership transfer is NOT the production administrator/multisig transfer rehearsal. Neither is proof of spendable rewards. The V19 permanent-custody model, IA-01, independent reviewer sign-off, and production controls remain separate open requirements. V51 remains a separate review candidate; no promotion is made here.

Frozen `v19/`, release selection, historical proof, public deployment page, and mainnet controls are unchanged. NO MAINNET BROADCAST. No release blocker is closed by this change.
