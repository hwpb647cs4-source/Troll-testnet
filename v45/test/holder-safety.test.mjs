import assert from"node:assert/strict";import{classifyUnsignedStep,holderConfirmationText}from"../safety/holder-safety.mjs";
const T="0x1111111111111111111111111111111111111111";
let r=classifyUnsignedStep({chain_id:46630,expected_chain_id:46630,to:T,data:"0xa22cb465"+"0".repeat(128),value_raw:"0"},{knownContracts:{[T.toLowerCase()]:"TEST_NFT"}});
assert.equal(r.allowed,true);assert.ok(r.warnings.includes("GLOBAL_NFT_OPERATOR_APPROVAL"));assert.ok(holderConfirmationText(r,{chain_id:46630,to:T,value_raw:"0"}).includes("Target"));
r=classifyUnsignedStep({chain_id:4663,expected_chain_id:46630,to:T,data:"0x",value_raw:"0"});assert.equal(r.allowed,false);assert.ok(r.blocks.includes("WRONG_CHAIN"));
r=classifyUnsignedStep({chain_id:46630,to:T,data:"0x",value_raw:"1"});assert.ok(r.warnings.includes("NATIVE_VALUE_TRANSFER"));
console.log("V45 HOLDER SAFETY PASS");