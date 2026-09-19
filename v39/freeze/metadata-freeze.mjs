import crypto from "node:crypto";
function canonical(v){if(Array.isArray(v))return "["+v.map(canonical).join(",")+"]";if(v&&typeof v==="object")return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+canonical(v[k])).join(",")+"}";return JSON.stringify(v)}
export function sha256(v){return crypto.createHash("sha256").update(typeof v==="string"?v:canonical(v)).digest("hex")}
export function validateMetadataRecord(m){
  const errors=[];
  if(!Number.isInteger(m.token_id)||m.token_id<1||m.token_id>5000)errors.push("token_id");
  if(!m.name)errors.push("name");
  if(!m.image||!/^(ipfs|ar):\/\//.test(m.image))errors.push("immutable_image_uri");
  if(!Array.isArray(m.attributes))errors.push("attributes");
  if(!m.family)errors.push("family");
  if(!m.genesis_manifest_sha256)errors.push("genesis_manifest_sha256");
  return{valid:errors.length===0,errors,metadata_sha256:sha256(m)};
}
export function buildMetadataFreeze(records,{baseUri,expectedSupply=5000}={}){
  const ids=new Set(),hashes={},errors=[];
  for(const m of records){
    const v=validateMetadataRecord(m);
    if(!v.valid)errors.push({token_id:m.token_id,errors:v.errors});
    if(ids.has(m.token_id))errors.push({token_id:m.token_id,errors:["duplicate_token_id"]});
    ids.add(m.token_id);hashes[String(m.token_id)]=v.metadata_sha256;
  }
  const manifest={schema_version:"39.0.0",expected_supply:expectedSupply,record_count:records.length,base_uri:baseUri||null,token_hashes:hashes};
  return{valid:errors.length===0&&records.length===expectedSupply,errors,manifest,manifest_sha256:sha256(manifest),complete:records.length===expectedSupply};
}
export function compareFreeze(oldFreeze,newFreeze){
  const changed=[];
  const ids=new Set([...Object.keys(oldFreeze.manifest.token_hashes||{}),...Object.keys(newFreeze.manifest.token_hashes||{})]);
  for(const id of ids)if(oldFreeze.manifest.token_hashes[id]!==newFreeze.manifest.token_hashes[id])changed.push(Number(id));
  return{same:changed.length===0&&oldFreeze.manifest_sha256===newFreeze.manifest_sha256,changed_token_ids:changed};
}
