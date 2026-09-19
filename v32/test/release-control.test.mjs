import assert from "node:assert/strict";import{evaluateRelease,assertNoBroadcast,REQUIRED_GATES}from"../control/release-gates.mjs";
const m=JSON.parse(await import("node:fs").then(fs=>fs.readFileSync("v32/release-manifest.json","utf8")));
const r=evaluateRelease(m.gates);
assert.equal(r.ready,false);assert.equal(r.summary.total,REQUIRED_GATES.length);assert.ok(r.summary.pass>=5);assert.ok(r.blocking.some(x=>x.id==="INDEPENDENT_HUMAN_AUDIT"));
assert.throws(()=>assertNoBroadcast(m.gates),/NO_MAINNET_BROADCAST/);
const all=Object.fromEntries(REQUIRED_GATES.map(([id])=>[id,{status:"PASS"}]));assert.equal(assertNoBroadcast(all),true);
console.log("V32 RELEASE CONTROL TEST PASS",r.summary);