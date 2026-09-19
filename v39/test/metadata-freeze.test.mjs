import assert from"node:assert/strict";import{validateMetadataRecord,buildMetadataFreeze,compareFreeze}from"../freeze/metadata-freeze.mjs";
const rec=i=>({token_id:i,name:"TROLL #"+i,image:"ipfs://cid/"+i,family:"NVIDIA",genesis_manifest_sha256:"0xabc",attributes:[{trait_type:"Series",value:"Genesis I"}]});
assert.equal(validateMetadataRecord(rec(1)).valid,true);
assert.equal(validateMetadataRecord({...rec(1),image:"https://mutable.example/1.png"}).valid,false);
const a=buildMetadataFreeze([rec(1),rec(2)],{baseUri:"ipfs://meta/",expectedSupply:2});assert.equal(a.valid,true);assert.equal(a.complete,true);assert.equal(a.manifest_sha256.length,64);
const b=buildMetadataFreeze([rec(1),{...rec(2),family:"GOLD"}],{baseUri:"ipfs://meta/",expectedSupply:2});const d=compareFreeze(a,b);assert.equal(d.same,false);assert.deepEqual(d.changed_token_ids,[2]);
const incomplete=buildMetadataFreeze([rec(1)],{expectedSupply:2});assert.equal(incomplete.valid,false);
console.log("V39 METADATA FREEZE TEST PASS");