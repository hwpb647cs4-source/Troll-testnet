import assert from "node:assert/strict";
import { emptyState,applyTransfer,applyBurn,finalize } from "../indexer/indexer.mjs";

const Z="0x0000000000000000000000000000000000000000";
const A="0x1111111111111111111111111111111111111111";
const B="0x2222222222222222222222222222222222222222";
const s=emptyState(46630,"0x72751B23ad3585d58c40A4F58dBc6A8F3566E19D",100);

applyTransfer(s,{blockNumber:101,transactionHash:"0x01",from:Z,to:A,tokenId:1n});
applyBurn(s,{blockNumber:102,transactionHash:"0x02",tokenId:1n,owner:A,requestedAmount:175000n,creditedAmount:175000n,cumulativeAmount:175000n,state:4n});
applyTransfer(s,{blockNumber:103,transactionHash:"0x03",from:A,to:B,tokenId:1n});
finalize(s,175000n,103);

assert.equal(s.totals.mints,1);
assert.equal(s.totals.transfers,1);
assert.equal(s.totals.burn_events,1);
assert.equal(s.tokens["1"].owner,B);
assert.equal(s.tokens["1"].transfer_count,1);
assert.equal(s.tokens["1"].burned_raw,"175000");
assert.equal(s.tokens["1"].state,4);
assert.equal(s.metrics.current_unique_owners,1);
assert.equal(s.owners[B.toLowerCase()],1);
assert.equal(s.owners[A.toLowerCase()],undefined);
assert.equal(s.metrics.evolved_tokens,1);
console.log("V26 EVENT INDEXER UNIT TEST PASS");
