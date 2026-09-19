import crypto from"node:crypto";
function sha(b){return crypto.createHash("sha256").update(b).digest("hex")}
function addr(a){return /^0x[0-9a-fA-F]{40}$/.test(String(a||""))}
export function buildDeploymentManifest(input){
  const errors=[];
  if(input.chain_id!==4663)errors.push("CHAIN_ID");
  if(!/^[0-9a-f]{40}$/.test(input.reviewed_commit||""))errors.push("REVIEWED_COMMIT");
  if(!Array.isArray(input.contracts)||!input.contracts.length)errors.push("CONTRACTS");
  const contracts=(input.contracts||[]).map((c,i)=>{
    if(!c.name)errors.push("NAME:"+i);
    if(!/^[0-9a-f]{64}$/.test(c.creation_bytecode_sha256||""))errors.push("CREATION_HASH:"+i);
    if(!/^[0-9a-f]{64}$/.test(c.runtime_bytecode_sha256||""))errors.push("RUNTIME_HASH:"+i);
    if(!Array.isArray(c.constructor_args))errors.push("ARGS:"+i);
    if(c.expected_address&&!addr(c.expected_address))errors.push("ADDRESS:"+i);
    return{...c,constructor_args_sha256:sha(Buffer.from(JSON.stringify(c.constructor_args||[])))};
  });
  const manifest={schema_version:"41.0.0",mode:"REHEARSAL_ONLY_NO_BROADCAST",chain_id:input.chain_id,reviewed_commit:input.reviewed_commit,contracts,roles:input.roles||{},metadata_manifest_sha256:input.metadata_manifest_sha256||null,asset_registry_manifest_sha256:input.asset_registry_manifest_sha256||null};
  manifest.manifest_sha256=sha(Buffer.from(JSON.stringify(manifest)));
  return{valid:errors.length===0,errors,manifest};
}
export function compareDeployment(manifest,observed){
  const errors=[];
  for(const c of manifest.contracts){
    const o=observed.contracts?.[c.name];
    if(!o){errors.push("MISSING:"+c.name);continue}
    if(o.runtime_bytecode_sha256!==c.runtime_bytecode_sha256)errors.push("RUNTIME_MISMATCH:"+c.name);
    if(c.expected_address&&o.address?.toLowerCase()!==c.expected_address.toLowerCase())errors.push("ADDRESS_MISMATCH:"+c.name);
  }
  return{match:errors.length===0,errors};
}
