import assert from"node:assert/strict";import{classifyIncident,responsePlan,canCloseIncident}from"../response/incident-response.mjs";
assert.equal(classifyIncident({type:"CONTRACT",flags:{active_asset_loss:true}}).severity,"SEV0");
assert.equal(classifyIncident({type:"ASSET_REGISTRY",flags:{wrong_asset_enabled:true}}).severity,"SEV1");
assert.equal(classifyIncident({type:"RPC",flags:{rpc_outage:true}}).severity,"SEV2");
assert.equal(classifyIncident({type:"PASSPORT",flags:{}}).severity,"SEV3");
const p=responsePlan({type:"ASSET_REGISTRY",flags:{wrong_asset_enabled:true}});assert.ok(p.steps.includes("DISABLE_AFFECTED_ASSET"));assert.ok(p.steps.includes("BLOCK_RELEASE"));
assert.equal(canCloseIncident({root_cause:"x",remediation:"x",regression_evidence:"x",verification_evidence:"x",postmortem:"x"}).closable,true);
assert.equal(canCloseIncident({}).closable,false);
console.log("V43 INCIDENT RESPONSE PASS");