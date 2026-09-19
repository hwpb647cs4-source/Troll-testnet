# TROLL NFT 2.0 — V19 Slither Remediation

V19 is a narrow remediation branch for the two Medium Slither findings discovered against frozen V15.

## Fix 1 — native ETH lock

V15's passive vault accepted native ETH but intentionally exposed no withdrawal/execute path. Slither correctly identified that direct ETH could become permanently locked.

V19 removes the payable receive path entirely. The passive vault rejects direct native ETH. ERC-20/ERC-721/ERC-1155 reward custody remains supported.

## Fix 2 — mint callback reentrancy

V15 used `_safeMint` inside the mint loop and wrote project timestamp fields after the receiver callback.

V19:
- makes `mintFromController` nonReentrant;
- reserves the entire token-ID range before any callback;
- writes mint/holder timestamps before the first `_safeMint`;
- includes a malicious receiver regression test that attempts recursive minting.

## Scope

No new product utility is added. The 5,000 supply, frozen family root, TROLL evolution, passive vault model, reward lanes, metadata, Lens and entitlement model are unchanged.

If V19 passes full regression + Slither, V19 becomes the new candidate for independent review. It does **not** inherit the V15 audit target automatically.
