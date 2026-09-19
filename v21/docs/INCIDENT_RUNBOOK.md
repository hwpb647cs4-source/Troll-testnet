# Production Incident Runbook — Draft

This runbook is intentionally conservative.

## Before deployment
- freeze exact reviewed commit;
- record compiled runtime bytecode hashes;
- verify deployer and multisig addresses out-of-band;
- fund deployer with only the minimum expected ETH plus buffer;
- verify Robinhood Chain ID = 4663 immediately before signing.

## If deployment address/bytecode differs
- stop immediately;
- do not configure roles;
- do not fund contracts;
- compare compiler/dependency settings and constructor args;
- open incident record.

## If admin ownership is wrong
- do not proceed with minting or asset registration;
- if recoverable via Ownable2Step pending-owner flow, reconcile under independent review;
- otherwise abandon deployment and redeploy from reviewed source.

## If asset registry entry is wrong
- disable/correct before any reward routing;
- record chain ID, contract, symbol, decimals and lane;
- independently re-verify issuer source.

## If unexpected token behavior appears
- disable the asset;
- do not route additional rewards;
- assess fee-on-transfer/rebase/blacklist/transfer-restriction behavior;
- add a regression test before re-enabling.

## If a security finding appears after deployment
- stop new mint/reward operations where operationally possible;
- preserve evidence;
- notify reviewers;
- do not conceal or overwrite the incident trail;
- determine whether a migration/redeployment is required.
