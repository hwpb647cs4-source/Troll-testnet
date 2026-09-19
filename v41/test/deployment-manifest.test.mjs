import assert from"node:assert/strict";import{buildDeploymentManifest,compareDeployment}from"../manifest/deployment-manifest.mjs";
const H="a".repeat(64),R="b".repeat(64);
const x=buildDeploymentManifest({chain_id:4663,reviewed_commit:"c3750b9458156e962393059f78c92e79802bf622",contracts:[{name:"Genesis",creation_bytecode_sha256:H,runtime_bytecode_sha256:R,constructor_args:["0x1111111111111111111111111111111111111111"]}]});
assert.equal(x.valid,true);assert.equal(x.manifest.mode,"REHEARSAL_ONLY_NO_BROADCAST");assert.equal(x.manifest.manifest_sha256.length,64);
assert.equal(compareDeployment(x.manifest,{contracts:{Genesis:{runtime_bytecode_sha256:R,address:"0x1111111111111111111111111111111111111111"}}}).match,true);
assert.equal(compareDeployment(x.manifest,{contracts:{Genesis:{runtime_bytecode_sha256:H}}}).match,false);
assert.equal(buildDeploymentManifest({chain_id:46630,reviewed_commit:"bad",contracts:[]}).valid,false);
console.log("V41 DEPLOYMENT MANIFEST PASS");