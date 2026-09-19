# TROLL NFT 2.0 — V43 Incident Response

V43 defines what happens when something goes wrong.

## Severity
- **SEV0** — active asset loss, exposed signing secret, unauthorized admin change.
- **SEV1** — exploitable contract issue, wrong production asset, false financial state, release-gate bypass.
- **SEV2** — index corruption, metadata mismatch, RPC outage, stale Passport.
- **SEV3** — low-impact operational/data issue.

## First principles
1. preserve evidence;
2. do not conceal the incident;
3. stop/limit affected operations where operationally possible;
4. do not improvise contract/admin changes outside the reviewed role process;
5. block release for material security incidents;
6. add a regression for every technical root cause;
7. independently verify remediation;
8. publish an appropriate postmortem.

## Asset registry incident
Disable the affected asset before additional reward routing and reverify exact chain/contract/issuer evidence.

## Indexer incident
The blockchain remains canonical. Rewind to a known-good block/hash and replay.

## Passport incident
Mark affected fields stale/unverified rather than showing uncertain data as current truth.

## Signing-key incident
No secret belongs in the repository. If a production role is compromised, rotate using the approved multisig/role ceremony and preserve the evidence trail.

## Closure
An incident cannot close without:
- root cause;
- remediation;
- regression evidence;
- verification evidence;
- postmortem.

## Current production context
Mainnet is not authorized, so this runbook is preparation. It does not itself grant emergency admin powers or change V19.
