const assert=require("assert");
const fs=require("fs");
const p=require("../regulated-asset-lanes.json");
const r=require("../assets/robinhood-assets.generated.json");
assert.equal(p.chain_id,4663);
assert.equal(p.assets.length,9);
for(const x of p.assets){
  assert.equal(x.lane,"REGULATED_ENTITLEMENT");
  const a=r.assets.find(v=>v.symbol===x.symbol);
  assert.ok(a,x.symbol);
  assert.equal(a.chain_id,4663);
  assert.equal(a.status,"ASSET_STATUS_ACTIVE");
  assert.equal(a.decimals,18);
  assert.match(a.contract_address,/^0x[0-9a-fA-F]{40}$/);
}
assert.equal(p.direct_vault_policy.regulated_assets_allowed,false);
assert.equal(p.entitlement_policy.settlement_status,"LEGAL_COMPLIANCE_GATE_OPEN");
console.log("PRODUCTION REGULATED ASSET LANE PASS");