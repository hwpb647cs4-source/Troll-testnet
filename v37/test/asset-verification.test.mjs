import assert from"node:assert/strict";import{findCanonicalDeployment,verifyConfiguredAsset}from"../verification/robinhood-assets.mjs";
const assets=[{id:"0xuid",tokenSymbol:"AAPL",tokenName:"Apple Token",status:"ASSET_STATUS_ACTIVE",currentMultiplier:"1.0",deployments:[{chainId:4663,contractAddress:"0x1111111111111111111111111111111111111111"}]}];
const r=findCanonicalDeployment(assets,"AAPL",4663);assert.equal(r.verified,true);assert.equal(r.identity,"4663:0x1111111111111111111111111111111111111111");
assert.equal(verifyConfiguredAsset(assets,{symbol:"AAPL",chain_id:4663,contract_address:"0x1111111111111111111111111111111111111111"}).verified,true);
assert.equal(verifyConfiguredAsset(assets,{symbol:"AAPL",chain_id:4663,contract_address:"0x2222222222222222222222222222222222222222"}).verified,false);
assert.equal(findCanonicalDeployment(assets,"NVDA",4663).verified,false);
console.log("V37 ASSET VERIFICATION TEST PASS");