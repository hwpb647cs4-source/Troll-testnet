import assert from"node:assert/strict";import{validateClaim,auditClaims,passportClaim}from"../claims/claims-integrity.mjs";
const good={id:"1",text:"NVIDIA family affinity.",evidence_class:"REFERENCE_ONLY",evidence_ref:"family:5"};assert.equal(validateClaim(good).valid,true);
assert.equal(validateClaim({...good,text:"This NFT owns NVIDIA shares."}).valid,false);
assert.equal(validateClaim({...good,text:"Guaranteed return from this NFT."}).valid,false);
assert.equal(validateClaim({...good,text:"Officially endorsed by Robinhood."}).valid,false);
const b=passportClaim({kind:"BALANCE",symbol:"USDC",amount:"100",evidenceClass:"LIVE_ONCHAIN_BALANCE",evidenceRef:"block:1"});assert.equal(validateClaim(b).valid,true);
assert.throws(()=>passportClaim({kind:"BALANCE",symbol:"NVDA",amount:"5",evidenceClass:"REFERENCE_ONLY",evidenceRef:"theme"}));
assert.equal(auditClaims([good,b]).valid,true);
console.log("V42 CLAIMS INTEGRITY PASS");