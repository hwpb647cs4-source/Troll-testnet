# TROLL NFT 2.0 — V39 Production Metadata Freeze

V39 prepares the metadata/CID production gate without generating or pretending that unfinished metadata is final.

## Freeze requirements
Before `PRODUCTION_METADATA_CIDS` can become PASS:
1. exactly 5,000 metadata records exist;
2. token IDs are unique and complete;
3. every image uses an immutable content-addressed URI such as IPFS/Arweave;
4. every record includes family/provenance;
5. every metadata JSON gets a canonical SHA-256;
6. the complete token-hash map gets one manifest SHA-256;
7. the final base URI/CID is recorded;
8. the frozen manifest is independently reproduced;
9. the exact frozen artifact is used for production.

## Change detection
After freeze, any change to any token metadata produces:
- a different token hash;
- a different collection manifest hash;
- a list of changed token IDs.

There is no silent post-freeze edit.

## Dynamic evolution
The V19 metadata router can select evolution-state metadata paths. That does not mean Genesis identity/provenance should be mutable.

Production should freeze every allowed metadata state before launch or explicitly document any intentionally dynamic fields and their trust model.

## Current status
**OPEN — NOT FROZEN**

V39 provides the tooling only. It does not claim that the 5,000 final production records/images/CIDs already exist.

## Security
No Solidity changes. V19 remains frozen.
