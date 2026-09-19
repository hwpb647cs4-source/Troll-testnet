const fs=require("fs");
const assert=require("assert");

const schema=JSON.parse(fs.readFileSync("v22/schemas/value-passport.schema.json","utf8"));
const sample=JSON.parse(fs.readFileSync("v22/examples/token-0001-passport.json","utf8"));
const constitution=fs.readFileSync("v22/docs/GROWTH_FLYWHEEL_CONSTITUTION.md","utf8");

const required=new Set(schema.required||[]);
const checks={
  schemaVersion:sample.schema_version==="22.0.0",
  tokenRange:Number.isInteger(sample.token_id)&&sample.token_id>=1&&sample.token_id<=5000,
  allTopLevelRequired:[...required].every(k=>Object.prototype.hasOwnProperty.call(sample,k)),
  genesisIdentity:sample.identity?.series==="GENESIS_I",
  ascendedExample:sample.evolution?.state==="ASCENDED",
  weight2x:sample.evolution?.reward_weight_bps===20000,
  vaultAddressPresent:typeof sample.vault?.address==="string"&&sample.vault.address.startsWith("0x"),
  exactAssetIdentity:(sample.vault?.assets||[]).every(a=>Number.isInteger(a.chain_id)&&typeof a.contract==="string"&&a.contract.length>0),
  entitlementSeparate:Array.isArray(sample.entitlements)&&sample.entitlements.length>0,
  humanSignatureRequired:sample.agent?.human_signature_required===true,
  noGuaranteedAppreciation:constitution.includes("No guaranteed appreciation"),
  noGuaranteedYield:constitution.includes("No guaranteed yield"),
  noWashTrading:constitution.includes("No wash trading or fake volume"),
  noManufacturedSqueeze:constitution.includes("No manufactured or coordinated market squeeze"),
  noPrivateKeys:constitution.includes("No use of customer/private wallet keys"),
  noHiddenFindings:constitution.includes("No hiding security findings")
};

for(const [k,v] of Object.entries(checks)){
  console.log((v?"PASS":"FAIL")+" "+k);
  assert.ok(v,k);
}
console.log("V22 VALUE/GROWTH VALIDATION PASS");
