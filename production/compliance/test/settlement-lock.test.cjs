const assert=require("assert");
const x=require("../settlement-compliance-lock.json");
assert.equal(x.gate,"REGULATED_SETTLEMENT_APPROVED");
assert.equal(x.status,"OPEN");
assert.equal(x.default_mode,"REGULATED_REWARDS_DISABLED");
for(const v of Object.values(x.deployment_switches)) assert.equal(v,false);
assert.ok(x.restrictions.terminology.includes("Stock Tokens"));
assert.ok(x.restrictions.us_distribution.includes("legal/compliance review"));
console.log("PRODUCTION SETTLEMENT COMPLIANCE LOCK PASS");