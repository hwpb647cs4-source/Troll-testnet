# TROLL NFT 2.0 — V30 Noncustodial Agent Policy

V30 prepares the agent-control layer without giving an AI custody or autonomous signing power.

## Flow
**resolve NFT → read passport → inspect policy → prepare intent → simulate → return unsigned transaction → human owner signs → later verify**

## Default-deny
The policy defaults to:
- human signature required;
- simulation required;
- native-value transfer blocked;
- no TROLL burn limit configured, therefore evolution preparation is blocked until an explicit limit is set;
- target and asset allowlists supported.

## Agent actions
Initial action vocabulary:
- READ_PASSPORT
- READ_BALANCES
- READ_HISTORY
- PREPARE_EVOLUTION
- PREPARE_APPROVED_REWARD

Preparation is not execution.

## Security rule
An AI agent never receives:
- seed phrase;
- private key;
- raw signing authority;
- unrestricted arbitrary-call permission.

V30 only evaluates policy and prepares an unsigned step after a successful simulation. The owner remains the signer.

## Future integration
This policy layer can sit in front of ERC-6551/operating-account tooling or other wallet infrastructure, but production integration must be separately security-reviewed before it can affect assets.
