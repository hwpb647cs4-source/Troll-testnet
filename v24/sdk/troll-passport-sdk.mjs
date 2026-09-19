export const TROLL_FAMILIES=[
"GENESIS TROLL","SILVER","USDC","GOLD","APPLE","NVIDIA","MICROSOFT","AMAZON","ALPHABET","META","TESLA"
];
export const TROLL_STATES=["GENESIS","AWAKENED","CHARGED","RELIC","ASCENDED","LEGENDARY","OMEGA"];

export function normalizeAddress(a){
  return typeof a==="string"?a.toLowerCase():a;
}
export function shortAddress(a){
  return a&&a.startsWith("0x")?a.slice(0,8)+"…"+a.slice(-6):a;
}
export function derivePassportStamps(p){
  const out=[];
  if(p?.identity?.series==="GENESIS_I")out.push({id:"GENESIS_I",label:"Genesis I"});
  if(p?.identity?.family_revealed)out.push({id:"FAMILY_VERIFIED",label:(p.identity.family||"Family")+" Verified"});
  if(p?.evolution?.state)out.push({id:p.evolution.state,label:p.evolution.state});
  if(p?.bound_vault)out.push({id:"VAULT_CREATED",label:"Vault Created"});
  if(p?.live_assets?.some(x=>x.asset_class==="GOLD"))out.push({id:"GOLD_HELD",label:"Gold Held"});
  if(p?.live_assets?.some(x=>x.asset_class==="SILVER"))out.push({id:"SILVER_HELD",label:"Silver Held"});
  if(p?.entitlements?.length)out.push({id:"REGULATED_ENTITLEMENT",label:"Regulated Entitlement"});
  if((p?.ownership?.transfer_count||0)>0)out.push({id:"HISTORY_PRESERVED",label:"History Preserved"});
  if(p?.agent?.human_signature_required)out.push({id:"HUMAN_SIGNED_AGENT",label:"Human-Signed Agent"});
  return out;
}
export function valuePassportSummary(p){
  return {
    token_id:p.token_id,
    family:p.identity?.family||null,
    state:p.evolution?.state||null,
    reward_weight_x:p.evolution?.reward_weight_x||null,
    bound_vault:p.bound_vault||null,
    live_asset_count:(p.live_assets||[]).length,
    entitlement_count:(p.entitlements||[]).length,
    stamps:derivePassportStamps(p).map(x=>x.id),
    as_of_block:p.evidence?.as_of_block??p.as_of_block??null
  };
}
