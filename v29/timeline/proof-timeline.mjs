const ORDER={MINT:10,FAMILY_VERIFIED:20,TROLL_BURN:30,EVOLUTION:40,VAULT_CREATED:50,REWARD:60,ENTITLEMENT:70,STAMP:80,TRANSFER:90,AGENT:100};

function key(e){return [e.block??0,e.transaction_index??0,e.log_index??0,ORDER[e.type]??999,e.id??""].join(":")}
export function normalizeEvent(e){
  if(!e||!e.type)throw new Error("event type required");
  return {
    id:e.id||key(e),type:e.type,token_id:Number(e.token_id),
    block:e.block??null,timestamp:e.timestamp??null,tx:e.tx??null,
    title:e.title||e.type,detail:e.detail||null,
    evidence_label:e.evidence_label||"REFERENCE_ONLY",
    evidence_ref:e.evidence_ref||null,
    data:e.data||{}
  };
}
export function buildAccumulationTimeline({tokenId,indexHistory,rewardLedger,passport,extraEvents=[]}){
  const id=Number(tokenId),events=[];
  for(const e of indexHistory?.timelines?.transfers||[]){
    if(Number(e.token_id)!==id)continue;
    const mint=(e.from||"").toLowerCase()==="0x0000000000000000000000000000000000000000";
    events.push(normalizeEvent({type:mint?"MINT":"TRANSFER",token_id:id,block:e.block,tx:e.tx,title:mint?"Genesis Mint":"Ownership Transfer",evidence_label:"LIVE_ONCHAIN_BALANCE",evidence_ref:e.tx,data:{from:e.from,to:e.to}}));
  }
  let previousState=null;
  for(const e of indexHistory?.timelines?.burns||[]){
    if(Number(e.token_id)!==id)continue;
    events.push(normalizeEvent({type:"TROLL_BURN",token_id:id,block:e.block,tx:e.tx,title:"TROLL Burn",detail:e.credited_raw+" raw units credited",evidence_label:"LIVE_ONCHAIN_BALANCE",evidence_ref:e.tx,data:e}));
    if(previousState!==e.state){
      events.push(normalizeEvent({type:"EVOLUTION",token_id:id,block:e.block,tx:e.tx,title:"Evolution State "+e.state,evidence_label:"LIVE_ONCHAIN_BALANCE",evidence_ref:e.tx,data:{state:e.state}}));
      previousState=e.state;
    }
  }
  for(const r of rewardLedger?.by_token?.[id]||[]){
    events.push(normalizeEvent({type:r.label==="REGULATED_ENTITLEMENT"?"ENTITLEMENT":"REWARD",token_id:id,block:r.block??null,timestamp:r.timestamp??null,tx:r.tx??null,title:(r.symbol||r.asset_class)+" Accumulation",detail:r.amount_raw+" raw units",evidence_label:r.label,evidence_ref:r.evidence_ref,data:r}));
  }
  if(passport?.identity?.family_revealed)events.push(normalizeEvent({type:"FAMILY_VERIFIED",token_id:id,title:(passport.identity.family||"Family")+" Verified",evidence_label:"LIVE_ONCHAIN_BALANCE",evidence_ref:passport.identity.family_merkle_root}));
  if(passport?.bound_vault)events.push(normalizeEvent({type:"VAULT_CREATED",token_id:id,title:"Persistent Vault",detail:passport.bound_vault,evidence_label:"LIVE_ONCHAIN_BALANCE",evidence_ref:passport.bound_vault}));
  for(const e of extraEvents)if(Number(e.token_id)===id)events.push(normalizeEvent(e));

  const dedupe=new Map();
  for(const e of events)dedupe.set(e.id,e);
  return [...dedupe.values()].sort((a,b)=>{
    const ta=a.timestamp??Number.MAX_SAFE_INTEGER,tb=b.timestamp??Number.MAX_SAFE_INTEGER;
    if(ta!==tb)return ta-tb;
    const ba=a.block??Number.MAX_SAFE_INTEGER,bb=b.block??Number.MAX_SAFE_INTEGER;
    if(ba!==bb)return ba-bb;
    return (ORDER[a.type]??999)-(ORDER[b.type]??999);
  });
}
export function accumulationSummary(events){
  const counts={},labels={};
  for(const e of events){counts[e.type]=(counts[e.type]||0)+1;labels[e.evidence_label]=(labels[e.evidence_label]||0)+1}
  return {events:events.length,types:counts,evidence_labels:labels,first_timestamp:events.find(x=>x.timestamp)?.timestamp??null,last_timestamp:[...events].reverse().find(x=>x.timestamp)?.timestamp??null};
}
