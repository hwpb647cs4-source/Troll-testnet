import assert from"node:assert/strict";import{reconcileBalance,detectMultiplierChange,corporateActionStamp}from"../integrity/corporate-actions.mjs";
const base={uid:"asset-1",symbol:"NVDA",chain_id:4663,contract_address:"0x1111111111111111111111111111111111111111",current_multiplier:"1.0",pending_multiplier:null,status:"ACTIVE",observed_at:"2026-09-19T00:00:00Z"};
const x=reconcileBalance({raw_balance:"5000000000000000000",decimals:18,asset:base});
assert.equal(x.identity,"4663:0x1111111111111111111111111111111111111111");assert.equal(x.pending_change,false);
const next={...base,current_multiplier:"2.0",observed_at:"2026-09-20T00:00:00Z"};
const c=detectMultiplierChange(base,next);assert.equal(c.changed,true);assert.equal(c.requires_snapshot,true);assert.equal(corporateActionStamp(c).id,"CORPORATE_ACTION_OBSERVED");
assert.throws(()=>detectMultiplierChange(base,{...next,contract_address:"0x2222222222222222222222222222222222222222"}),/identity mismatch/);
console.log("V38 CORPORATE ACTION INTEGRITY PASS");