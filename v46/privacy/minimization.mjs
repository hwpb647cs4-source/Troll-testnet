const PUBLIC=new Set(["token_id","family","evolution_state","reward_weight_bps","bound_vault","stamps","as_of_block","proof_hash"]);
const CONDITIONAL=new Set(["current_owner","holder_since","transfer_count","asset_rows","entitlement_rows","agent_status"]);
const FORBIDDEN=new Set(["private_key","seed_phrase","mnemonic","email","phone","ip_address","device_id","precise_location","legal_name"]);
export function minimizePassport(input,{includeConditional=false}={}){
  const out={};
  for(const [k,v] of Object.entries(input||{})){
    if(FORBIDDEN.has(k))continue;
    if(PUBLIC.has(k)||(includeConditional&&CONDITIONAL.has(k)))out[k]=v;
  }
  return out;
}
export function auditDisclosure(obj){
  const violations=[];
  function walk(v,path=[]){
    if(Array.isArray(v)){v.forEach((x,i)=>walk(x,[...path,i]));return}
    if(v&&typeof v==="object")for(const [k,x] of Object.entries(v)){if(FORBIDDEN.has(k))violations.push([...path,k].join("."));walk(x,[...path,k])}
  }
  walk(obj);
  return{safe:violations.length===0,violations};
}
export function retentionPolicy(kind){
  const table={
    PUBLIC_CHAIN_EVIDENCE:{retention:"INDEFINITE_REFERENCE",reason:"public canonical evidence"},
    SECURITY_LOG:{retention:"LIMITED_SECURITY_WINDOW",reason:"incident/security operations"},
    ANALYTICS_AGGREGATE:{retention:"AGGREGATED_ONLY",reason:"product metrics"},
    USER_SECRET:{retention:"NEVER_COLLECT",reason:"noncustodial boundary"},
    PRECISE_LOCATION:{retention:"NEVER_COLLECT",reason:"not required for protocol"}
  };
  if(!table[kind])throw new Error("unknown data kind");
  return table[kind];
}
