# TROLL NFT 2.0 — V18 Slither Static Analysis

V18 does not change the audited V15 Solidity source.

It adds a second automated security-analysis layer using Trail of Bits' Slither static analyzer.

## Toolchain

- Slither Analyzer: 0.11.6
- Solidity: 0.8.24
- OpenZeppelin: 5.1.0
- Node: 22

## Gate

The workflow:
1. verifies the exact V15 source tree is unchanged from audit target `5b5b9ce5...`;
2. installs and compiles V15;
3. runs the existing V15 adversarial tests;
4. runs Slither 0.11.6;
5. uploads the complete JSON static-analysis report;
6. fails the security gate on any **High** or **Medium** Slither detector.

Low/Informational/Optimization findings remain visible for manual review and the independent auditor.

This is additive evidence only. It does not replace independent review.
