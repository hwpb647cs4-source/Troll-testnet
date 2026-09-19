# V34 Security Findings Intake

V34 is the landing zone for Codex Security and independent human-audit findings.

## Rule
A scanner result is not silently ignored and is not automatically treated as exploitable.

Every finding gets:
- stable ID;
- source;
- severity;
- affected surface;
- description;
- reproduction;
- remediation;
- fix commit;
- ABI/storage/semantic impact;
- reviewer verification;
- status.

## Release policy
- OPEN Critical/High: release blocked.
- OPEN Medium: release blocked pending disposition.
- Low/Informational: tracked and reviewed.
- ACCEPTED_RISK must include written rationale and cannot be used for Critical/High.
- Code fixes create a new review target.
- CLOSED_VERIFIED requires evidence.

## Codex Security intake
When the plugin finishes connecting:
1. scan exact V19 commit `c3750b9458156e962393059f78c92e79802bf622`;
2. export findings without editing the target;
3. map each finding into this register;
4. deduplicate against Slither/manual findings;
5. reproduce valid findings;
6. fix on a new remediation branch only;
7. rerun full regressions + Slither + Codex;
8. update the audit target;
9. request human re-review for changed surfaces.

## Independent audit
Human-audit findings remain authoritative external evidence for the final production gate. Automated tools are additive.
