import assert from"node:assert/strict";import{createRecoverySnapshot,verifyRecoverySnapshot,selectRecoveryPoint,recoveryPlan}from"../recovery/recovery-integrity.mjs";
const H="0x"+"a".repeat(64),state={tokens:{"1":{owner:"0x1"}},cursor:100};
const s=createRecoverySnapshot({chainId:46630,indexedThroughBlock:100,blockHash:H,indexState:state,proofRoot:"0xroot",createdAt:"2026-09-19T00:00:00Z"});
assert.equal(verifyRecoverySnapshot(s,state).valid,true);assert.equal(verifyRecoverySnapshot(s,{...state,cursor:101}).valid,false);
const pick=selectRecoveryPoint([{...s,verified:true},{...s,indexed_through_block:90,verified:true}],{});assert.equal(pick.indexed_through_block,100);
assert.equal(recoveryPlan({snapshot:s,canonicalBlockHash:H,currentIndexedBlock:120}).action,"VERIFY_AND_RESUME");
assert.equal(recoveryPlan({snapshot:s,canonicalBlockHash:"0x"+"b".repeat(64),currentIndexedBlock:120}).action,"REWIND_BEFORE_SNAPSHOT");
assert.equal(recoveryPlan({snapshot:null,canonicalBlockHash:H,currentIndexedBlock:0}).action,"FULL_REINDEX");
console.log("V44 DATA RECOVERY INTEGRITY PASS");