import assert from "node:assert/strict";
import {buildHistoricalIntelligence} from "../analytics/historical.mjs";
import {buildActivityFeed} from "../analytics/activity-feed.mjs";

const Z="0x0000000000000000000000000000000000000000",A="0x1111111111111111111111111111111111111111",B="0x2222222222222222222222222222222222222222";
const index={totals:{mints:1,transfers:1,burn_events:3,total_burn_raw:"175000"},metrics:{minted_tokens:1,current_unique_owners:1},owners:{[B.toLowerCase()]:1},
tokens:{"1":{token_id:1,owner:B,minted_block:10,transfer_count:1,burned_raw:"175000",state:4,last_event_block:30}},
timelines:{transfers:[
{block:10,tx:"0x1",token_id:1,from:Z,to:A},{block:30,tx:"0x4",token_id:1,from:A,to:B}],
burns:[
{block:20,tx:"0x2",token_id:1,owner:A,credited_raw:"10000",cumulative_raw:"10000",state:1},
{block:21,tx:"0x3",token_id:1,owner:A,credited_raw:"65000",cumulative_raw:"75000",state:3},
{block:31,tx:"0x5",token_id:1,owner:B,credited_raw:"100000",cumulative_raw:"175000",state:4}]}
};
const ts={10:1000,20:2000,21:3000,30:87400,31:173000};
const h=buildHistoricalIntelligence(index,{blockTimestamps:ts,asOfTimestamp:174000});
assert.equal(h.collection.minted,1);
assert.equal(h.collection.transfers,1);
assert.equal(h.tokens["1"].ownership_periods.length,2);
assert.equal(h.tokens["1"].evolution_events.length,3);
assert.equal(h.tokens["1"].evolution_events[2].state_name,"ASCENDED");
assert.equal(h.tokens["1"].burn_acceleration.last_24h_raw,"100000");
assert.equal(h.tokens["1"].burn_acceleration.previous_24h_raw,"75000");
assert.ok(h.tokens["1"].burn_acceleration.ratio>1);
assert.equal(h.collection.state_distribution.ASCENDED,1);
const f=buildActivityFeed(index,{limit:3});
assert.equal(f.length,3); assert.equal(f[0].block,31); assert.equal(f[0].type,"TROLL_BURN");
console.log("V27 HISTORICAL INTELLIGENCE TEST PASS");
