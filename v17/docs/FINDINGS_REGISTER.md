# Audit Findings Register

| ID | Severity | Title | Affected Surface | Status | Fix Commit | Re-review |
|---|---|---|---|---|---|---|
| — | — | No independent findings received yet | — | WAITING_FOR_REVIEW | — | — |

## Status values
- WAITING_FOR_REVIEW
- OPEN
- FIX_IN_PROGRESS
- FIX_READY_FOR_REVIEW
- CLOSED_VERIFIED
- ACCEPTED_RISK

## Rules
- Never mark a finding CLOSED without reviewer confirmation or documented independent verification.
- Every Solidity fix changes the audit target commit.
- High/Critical findings block release unconditionally.
- Medium findings require explicit disposition before release.
