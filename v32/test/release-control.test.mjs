import assert from "node:assert/strict";
import{evaluateRelease,assertNoBroadcast,REQUIRED_GATES}from"../control/release-gates.mjs";
const fs=await import("node:fs");
const m=JSON.parse(fs.readFileSync("v32/release-manifest.json","utf8"));
const r=evaluateRelease(m.gates);

assert.equal(r.ready,false);
assert.equal(r.summary.total,REQUIRED_GATES.length);
assert.ok(r.summary.pass>=7);
assert.equal(r.summary.waived,1);
assert.equal(r.summary.notApplicable,1);
assert.equal(r.rows.find(x=>x.id==="INDEPENDENT_HUMAN_AUDIT").status,"WAIVED_BY_OWNER");
assert.ok(!r.blocking.some(x=>x.id==="INDEPENDENT_HUMAN_AUDIT"));
assert.ok(!r.blocking.some(x=>x.id==="REGULATED_SETTLEMENT_APPROVED"));
assert.equal(r.rows.find(x=>x.id==="EXPLICIT_MAINNET_AUTHORIZATION").status,"OPEN");
assert.ok(r.blocking.some(x=>x.id==="EXPLICIT_MAINNET_AUTHORIZATION"));
assert.ok(r.blocking.some(x=>x.id==="PRODUCTION_MULTISIG"));
assert.ok(r.blocking.some(x=>x.id==="PRODUCTION_METADATA_CIDS"));
assert.ok(r.blocking.some(x=>x.id==="DEDICATED_PRODUCTION_RPC"));
assert.ok(r.blocking.some(x=>x.id==="FINAL_DEPLOYMENT_REHEARSAL"));
assert.throws(()=>assertNoBroadcast(m.gates),/NO_MAINNET_BROADCAST/);

const all=Object.fromEntries(REQUIRED_GATES.map(([id])=>[id,{status:"PASS"}]));
assert.equal(assertNoBroadcast(all),true);

const approvedCoreOnly={
  ...all,
  INDEPENDENT_HUMAN_AUDIT:{status:"WAIVED_BY_OWNER"},
  REGULATED_SETTLEMENT_APPROVED:{status:"NOT_APPLICABLE_CORE_ONLY"}
};
assert.equal(assertNoBroadcast(approvedCoreOnly),true);

const invalidWaiver={...all,PRODUCTION_MULTISIG:{status:"WAIVED_BY_OWNER"}};
assert.throws(()=>assertNoBroadcast(invalidWaiver),/PRODUCTION_MULTISIG/);

const invalidNA={...all,PRODUCTION_METADATA_CIDS:{status:"NOT_APPLICABLE_CORE_ONLY"}};
assert.throws(()=>assertNoBroadcast(invalidNA),/PRODUCTION_METADATA_CIDS/);

console.log("V32 RELEASE CONTROL TEST PASS",r.summary);
