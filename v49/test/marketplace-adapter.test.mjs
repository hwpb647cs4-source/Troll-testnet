import assert from"node:assert/strict";import{marketplaceMetadata,auditMarketplaceMetadata,rewardTier}from"../metadata/marketplace-adapter.mjs";
const p={schema_version:"23.0.0",token_id:1,identity:{family:"NVIDIA",family_revealed:true},evolution:{state:"ASCENDED",reward_weight_bps:20000},bound_vault:"0xvault",ownership:{transfer_count:1}};
const m=marketplaceMetadata(p,{imageUri:"ipfs://cid/1.png",externalUrl:"https://example.test/passport/1"});
assert.equal(m.name,"TROLL #0001");assert.equal(auditMarketplaceMetadata(m).valid,true);assert.equal(rewardTier(20000),"ASCENDED");
assert.throws(()=>marketplaceMetadata(p,{imageUri:"https://mutable.example/1.png"}));
const bad={...m,attributes:[...m.attributes,{trait_type:"Guaranteed Return",value:"100%"}]};assert.equal(auditMarketplaceMetadata(bad).valid,false);
console.log("V49 MARKETPLACE INTEROPERABILITY PASS");