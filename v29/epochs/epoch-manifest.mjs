import crypto from "node:crypto";
const ALLOWED=new Set(["LIVE_ONCHAIN_BALANCE","REGULATED_ENTITLEMENT","HISTORICAL_PROOF","REFERENCE_ONLY"]);
function canonical(v){if(Array.isArray(v))return "["+v.map(canonical).join(",")+"]";if(v&&typeof v==="object")return "{"+Object.keys(v).sort().filter(k=>k!=="manifest_sha256").map(k=>JSON.stringify(k)+":"+canonical(v[k])).join(",")+"}";return JSON.stringify(v)}
export function hashEpochManifest(m){return crypto.createHash("sha256").update(canonical(m)).digest("hex")}
export function validateEpochManifest(m){
  const errors=[];
  if(!m.epoch_id)errors.push("epoch_id");
  if(!Number.isInteger(m.chain_id)||m.chain_id<1)errors.push("chain_id");
  if(!Array.isArray(m.allocations)||!m.allocations.length)errors.push("allocations");
  const seen=new Set();
  for(const [i,a] of (m.allocations||[]).entries()){
    if(!Number.isInteger(a.token_id)||a.token_id<1||a.token_id>5000)errors.push("token_id:"+i);
    if(!a.asset_contract)errors.push("asset_contract:"+i);
    if(!ALLOWED.has(a.label))errors.push("label:"+i);
    if(!/^[0-9]+$/.test(String(a.amount_raw)))errors.push("amount_raw:"+i);
    if(!Number.isInteger(a.decimals)||a.decimals<0||a.decimals>36)errors.push("decimals:"+i);
    const k=[a.token_id,m.chain_id,String(a.asset_contract).toLowerCase(),a.decimals,a.label].join(":");
    if(seen.has(k))errors.push("duplicate:"+i);seen.add(k);
  }
  return {valid:errors.length===0,errors,computed_sha256:hashEpochManifest(m)};
}
