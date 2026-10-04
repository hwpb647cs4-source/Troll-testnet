# TROLL V19 — Final Mainnet Rehearsal

This package prepares the exact frozen V19 candidate for Robinhood Chain mainnet **without broadcasting**.

## Canonical target

- Chain: Robinhood Chain
- Chain ID: 4663
- Gas: ETH
- Explorer: https://robinhoodchain.blockscout.com
- Frozen V19 commit: `c3750b9458156e962393059f78c92e79802bf622`

## Production RPC

Robinhood Chain documentation recommends a dedicated provider for production. The selected provider is Alchemy.

Expected endpoint shape:

`https://robinhood-mainnet.g.alchemy.com/v2/{API_KEY}`

Never commit the API key.

## Remaining human/external inputs

1. production multisig address + signer threshold;
2. final 5,000 metadata/image CIDs;
3. private production RPC credential.

Those values are deliberately absent from this repository until supplied and verified.

## Hard rule

This rehearsal must never broadcast. Mainnet deployment is a separate owner-confirmed step after every release gate is PASS.


CI trigger: final no-broadcast rehearsal after workflow landed on main.
