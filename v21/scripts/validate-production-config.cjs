const fs=require("fs");
const assert=require("assert");

const c=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
const placeholders=JSON.stringify(c).match(/REPLACE_WITH_[A-Z_]+/g)||[];

const checks={
  chain4663:c.network?.chain_id===4663,
  ethGas:c.network?.native_gas==="ETH",
  dedicatedProviderRequired:c.network?.production_provider_requirement==="DEDICATED_PROVIDER_REQUIRED",
  productionRpcEnv:c.network?.production_rpc_env==="RH_RPC_URL",
  auditTarget:/^[0-9a-f]{40}$/.test(c.audit_target_commit||""),
  exactV19Target:c.audit_target_commit==="c3750b9458156e962393059f78c92e79802bf622",
  supply5000:c.provenance?.supply===5000,
  slitherZeroHighMedium:c.provenance?.slither_high===0&&c.provenance?.slither_medium===0,
  templateBlocked:c.mode==="TEMPLATE_ONLY_DO_NOT_BROADCAST",
  placeholdersRemain:placeholders.length>0,
  allReleaseGatesFalse:Object.values(c.gates||{}).every(v=>v===false),
  noPretendDeployments:Object.values(c.contracts||{}).every(v=>v===null)
};

for(const [k,v] of Object.entries(checks)){
  console.log((v?"PASS":"FAIL")+" "+k);
  assert.ok(v,k);
}
console.log("V21 BLOCKED PRODUCTION TEMPLATE PASS");
console.log("Placeholders:",[...new Set(placeholders)].join(", "));
