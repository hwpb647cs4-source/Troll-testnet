import assert from"node:assert/strict";import{minimizePassport,auditDisclosure,retentionPolicy}from"../privacy/minimization.mjs";
const p={token_id:1,family:"NVIDIA",evolution_state:"ASCENDED",current_owner:"0x1",email:"x@example.com",private_key:"secret",precise_location:"x"};
const pub=minimizePassport(p);assert.equal(pub.token_id,1);assert.equal(pub.current_owner,undefined);assert.equal(pub.email,undefined);assert.equal(pub.private_key,undefined);
const extended=minimizePassport(p,{includeConditional:true});assert.equal(extended.current_owner,"0x1");
assert.equal(auditDisclosure(pub).safe,true);assert.equal(auditDisclosure({nested:{seed_phrase:"x"}}).safe,false);
assert.equal(retentionPolicy("USER_SECRET").retention,"NEVER_COLLECT");
console.log("V46 PRIVACY MINIMIZATION PASS");