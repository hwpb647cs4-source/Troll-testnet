# V19 Static Analysis Baseline

Pinned analyzer: **Slither 0.11.6**

## Final result

- High: **0**
- Medium: **0**
- Low: **1**
- Informational: **6**

Gate result:

**PASS — no High/Medium Slither detectors**

Artifact digest:

`sha256:0091d23313d9a606d2cf57c114ee22bf8245aa06e12a070d2b45154a1a1db774`

## History

V15 produced two Medium findings:
1. `locked-ether` on the passive vault;
2. `reentrancy-no-eth` on the safe-mint callback/state-write order.

V19 remediated both.

The first V19 rerun then surfaced two Medium `unused-return` warnings inside the deliberately malicious test receiver only. Those were removed by consuming the mint return values. No production behavior was changed by that follow-up.

The current V19 baseline is therefore the first state with:
- original findings remediated;
- malicious regression harness retained;
- High = 0;
- Medium = 0.
