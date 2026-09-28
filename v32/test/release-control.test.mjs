import assert from "node:assert/strict";
import{evaluateRelease,assertNoBroadcast,REQUIRED_GATES}from"../control/release-gates.mjs";
const fs=await import("node:fs");
const m=JSON.parse(fs.readFileSync("v32/release-manifest.json","utf8"));
const r=evaluateRelease(m.gates);

assert.equal(r.ready,false);
assert.equal(r.summary.total,REQUIRED_GATES.length);
assert.ok(r.summary.pass>=7);
assert.equal(r.summary.waived,1);\nassert.equal(r.summary.notApplicable,1);
assert.equal(r.rows.find(x=>x.id==="INDEPENDENT_HUMAN_AUDIT").status,"WAIVED_BY_OWNER");
assert.ok(!r.blocking.some(x=>x.id==="INDEPENDENT_HUMAN_AUDIT"));
assert.ok(!r.blocking.some(x=>x.id==="REGULATED_SETTLEMENT_APPROVED"));\nassert.equal(r.rows.find(x=>x.id==="EXPLICIT_MAINNET_AUTHORIZATION").status,"PASS");\nassert.ok(r.blocking.some(x=>x.id==="PRODUCTION_MULTISIG"));
assert.throws(()=>assertNoBroadcast(m.gates),/NO_MAINNET_BROADCAST/);

const all=Object.fromEntries(REQUIRED_GATES.map(([id])=>[id,{status:"PASS"}]));
assert.equal(assertNoBroadcast(all),true);

const humanWaived={...all,INDEPENDENT_HUMAN_AUDIT:{status:"WAIVED_BY_OWNER"}};
assert.equal(assertNoBroadcast(humanWaived),true);

const invalidWaiver={...all,PRODUCTION_MULTISIG:{status:"WAIVED_BY_OWNER"}};
assert.throws(()=>assertNoBroadcast(invalidWaiver),/PRODUCTION_MULTISIG/);

console.log("V32 RELEASE CONTROL TEST PASS",r.summary);
