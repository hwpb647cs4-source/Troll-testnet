import assert from "node:assert/strict";import{evaluateAgentIntent,prepareUnsignedStep}from"../policy/agent-policy.mjs";
const P={allowed_actions:["READ_PASSPORT","PREPARE_EVOLUTION"],approved_targets:["0x1111111111111111111111111111111111111111"],max_troll_burn_raw_per_action:"1000",human_signature_required:true,simulation_required:true};
assert.equal(evaluateAgentIntent(P,{action:"READ_PASSPORT"}).allowed,true);
assert.equal(evaluateAgentIntent(P,{action:"PREPARE_EVOLUTION",target:"0x1111111111111111111111111111111111111111",troll_burn_raw:"1001"}).allowed,false);
assert.equal(evaluateAgentIntent(P,{action:"UNKNOWN"}).allowed,false);
assert.equal(prepareUnsignedStep(P,{action:"PREPARE_EVOLUTION",chain_id:46630,target:"0x1111111111111111111111111111111111111111",troll_burn_raw:"1000",data:"0xabc"},{success:true}).status,"OWNER_SIGNATURE_REQUIRED");
assert.equal(prepareUnsignedStep(P,{action:"PREPARE_EVOLUTION",chain_id:46630,target:"0x1111111111111111111111111111111111111111",troll_burn_raw:"1000"},{success:false}).status,"SIMULATION_REQUIRED");
console.log("V30 AGENT POLICY TEST PASS");