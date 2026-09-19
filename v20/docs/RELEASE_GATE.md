# V20 Release Gate

TROLL remains **NO MAINNET BROADCAST** until all items below are complete.

## Independent review
- [ ] Independent reviewer identified
- [ ] Reviewer confirms exact commit `c3750b9458156e962393059f78c92e79802bf622`
- [ ] Manual report received
- [ ] High/Critical findings = 0 open
- [ ] Medium findings disposition documented
- [ ] Any fixes re-reviewed
- [ ] Final reviewed commit frozen

## Production identity/configuration
- [ ] Final production metadata CIDs frozen
- [ ] Final mint-controller configuration frozen
- [ ] Hardware-backed multisig/admin roles verified
- [ ] Royalty receiver verified
- [ ] Snapshot publisher verified
- [ ] Regulated entitlement admin verified

## Asset registry
- [ ] Every production asset mapped by chain ID + contract
- [ ] Gold contract independently verified
- [ ] Silver contract independently verified
- [ ] Each stock/tokenized-security contract independently verified
- [ ] Transfer restrictions reviewed
- [ ] Corporate-action / multiplier behavior reviewed
- [ ] DIRECT_VAULT vs REGULATED_ENTITLEMENT classification approved

## Deployment
- [ ] Dedicated production RPC/provider selected
- [ ] Exact constructor args frozen
- [ ] Reproducible bytecode manifest frozen
- [ ] Deployment-order rehearsal passed
- [ ] Blockscout verification rehearsal passed
- [ ] Ownership-transfer-to-multisig rehearsal passed
- [ ] Incident-response runbook approved
- [ ] Explicit final mainnet authorization

Until every gate closes: **NO MAINNET BROADCAST.**
