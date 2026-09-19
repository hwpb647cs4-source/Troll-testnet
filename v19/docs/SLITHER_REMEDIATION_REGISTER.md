# V19 Slither Remediation Register

## Origin

Automated Slither 0.11.6 run against frozen V15 reported:

### SLI-001 — Native ETH can be locked in passive vault
- Severity: Medium
- Detector: `locked-ether`
- V15 behavior: `TrollBoundVaultV15.receive()` accepted native ETH while the vault intentionally had no withdrawal/execute function.
- Remediation: V19 removes the payable native-ETH receive path. Direct ETH transfers revert.
- Regression: `rejects native ETH sent directly to the passive vault`.

### SLI-002 — State written after safe-mint receiver callback
- Severity: Medium
- Detector: `reentrancy-no-eth`
- V15 behavior: project timestamp fields were written after `_safeMint`, which may call an external `IERC721Receiver`.
- Remediation:
  - `mintFromController` uses `nonReentrant`;
  - reserves the full token-ID range before callbacks;
  - writes mint/holder timestamps before callbacks;
  - malicious receiver test attempts recursive mint and must fail.
- Regression: `blocks safeMint callback reentrancy and reserves state before callbacks`.

## First V19 Slither rerun

The original two V15 Medium findings disappeared.

The rerun found two new Medium `unused-return` warnings only inside the deliberately malicious **test harness** `ReentrantMintReceiverV19`.

Those were remediated by explicitly consuming/storing `mintFromController` return values. This does not alter production logic.

## Acceptance

V19 is acceptable for a new independent-review target only when:
- compile PASS;
- focused remediation tests PASS;
- full lifecycle test PASS;
- Slither High = 0;
- Slither Medium = 0;
- older V14/V15/V16/V17 regressions remain green.

V19 does not inherit any prior audit sign-off automatically.
