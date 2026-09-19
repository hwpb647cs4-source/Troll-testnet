import crypto from "node:crypto";
function sha(v){return crypto.createHash("sha256").update(typeof v==="string"?v:JSON.stringify(v)).digest("hex")}
export function createRecoverySnapshot({chainId,indexedThroughBlock,blockHash,indexState,proofRoot,createdAt}){
  if(!Number.isInteger(chainId)||chainId<1)throw new Error("chain");
  if(!Number.isInteger(indexedThroughBlock)||indexedThroughBlock<0)throw new Error("block");
  if(!/^0x[0-9a-fA-F]{64}$/.test(blockHash||""))throw new Error("block hash");
  const body={schema_version:"44.0.0",chain_id:chainId,indexed_through_block:indexedThroughBlock,block_hash:blockHash,index_state_sha256:sha(indexState),collection_proof_root:proofRoot||null,created_at:createdAt||new Date().toISOString()};
  return{...body,snapshot_sha256:sha(body)};
}
export function verifyRecoverySnapshot(snapshot,indexState){
  const errors=[];
  if(sha(indexState)!==snapshot.index_state_sha256)errors.push("INDEX_STATE_HASH");
  const body={...snapshot};delete body.snapshot_sha256;
  if(sha(body)!==snapshot.snapshot_sha256)errors.push("SNAPSHOT_HASH");
  return{valid:errors.length===0,errors};
}
export function selectRecoveryPoint(snapshots,{maxBlock=null}={}){
  const good=snapshots.filter(x=>x.verified===true&&(maxBlock===null||x.indexed_through_block<=maxBlock));
  if(!good.length)return null;
  return [...good].sort((a,b)=>b.indexed_through_block-a.indexed_through_block)[0];
}
export function recoveryPlan({snapshot,canonicalBlockHash,currentIndexedBlock}){
  if(!snapshot)return{action:"FULL_REINDEX",reason:"NO_VERIFIED_SNAPSHOT"};
  if(snapshot.block_hash.toLowerCase()!==String(canonicalBlockHash||"").toLowerCase())return{action:"REWIND_BEFORE_SNAPSHOT",reason:"BLOCK_HASH_MISMATCH",snapshot_block:snapshot.indexed_through_block};
  if(currentIndexedBlock<snapshot.indexed_through_block)return{action:"RESTORE_SNAPSHOT",snapshot_block:snapshot.indexed_through_block};
  return{action:"VERIFY_AND_RESUME",resume_block:snapshot.indexed_through_block+1};
}
