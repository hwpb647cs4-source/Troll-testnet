const LABELS=new Set(["LIVE_ONCHAIN_BALANCE","REGULATED_ENTITLEMENT","HISTORICAL_PROOF","REFERENCE_ONLY"]);

export function validateRewardRow(r){
  if(!r||!LABELS.has(r.label))throw new Error("invalid evidence label");
  if(!Number.isInteger(r.token_id)||r.token_id<1||r.token_id>5000)throw new Error("invalid token");
  if(!Number.isInteger(r.chain_id)||r.chain_id<1)throw new Error("invalid chain");
  if(typeof r.asset_contract!=="string"||!r.asset_contract)throw new Error("missing exact asset contract/reference");
  if(!/^[0-9]+$/.test(String(r.amount_raw)))throw new Error("invalid raw amount");
  if(!Number.isInteger(r.decimals)||r.decimals<0||r.decimals>36)throw new Error("invalid decimals");
  return true;
}
export function createRewardLedger(rows=[]){
  const out={schema_version:"28.0.0",rows:[],by_token:{},by_epoch:{},by_label:{},asset_units:{}};
  for(const r of rows){
    validateRewardRow(r);
    const row={...r,amount_raw:String(r.amount_raw)};
    out.rows.push(row);
    (out.by_token[row.token_id]??=[]).push(row);
    (out.by_epoch[row.epoch_id]??=[]).push(row);
    out.by_label[row.label]=(out.by_label[row.label]||0)+1;
    const key=[row.chain_id,row.asset_contract.toLowerCase(),row.decimals,row.label].join(":");
    out.asset_units[key]=(BigInt(out.asset_units[key]||"0")+BigInt(row.amount_raw)).toString();
  }
  return out;
}
export function tokenRewardBiography(ledger,tokenId){
  const rows=ledger.by_token[tokenId]||[];
  const epochs=[...new Set(rows.map(x=>x.epoch_id))];
  const classes={};
  for(const r of rows)classes[r.label]=(classes[r.label]||0)+1;
  return {token_id:Number(tokenId),reward_rows:rows.length,epochs,classes,rows};
}
export function safeAggregateUnits(ledger){
  return Object.entries(ledger.asset_units).map(([identity,amount_raw])=>({identity,amount_raw}));
}
