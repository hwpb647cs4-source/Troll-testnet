# V17 Change Control

## Frozen branch discipline

The audit target is the exact V15 merge commit. The V17 branch may add audit tooling, reports and manifests, but it must not mutate the reviewed V15 source tree.

CI enforces:

`git diff --exit-code 5b5b9ce5... HEAD -- v15/`

for the audited source/config/test surface.

## Allowed during audit

- documentation
- reviewer reports
- reproducible-build manifests
- source/ABI/bytecode hashes
- deployment rehearsal documents

## Not allowed without new target

- Solidity changes
- constructor changes
- storage-layout changes
- ABI changes
- role/permission changes
- dependency/compiler version changes that affect bytecode

## Finding remediation

Each accepted code fix must:
1. get a unique issue/finding ID;
2. land on a new remediation branch;
3. rerun V14/V15 regressions;
4. regenerate the build manifest;
5. be re-reviewed for the changed surface;
6. update the audit target commit.
