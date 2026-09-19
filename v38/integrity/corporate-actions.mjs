function dec(x){if(x===null||x===undefined||x==="")return null;const s=String(x);if(!/^[0-9]+(\.[0-9]+)?$/.test(s))throw new Error("invalid decimal");return s}
function parts(s){const [a,b=""]=s.split(".");return{n:BigInt(a+b),d:10n**BigInt(b.length)}}
function mulRaw(raw,multiplier){
  const r=BigInt(raw),m=parts(dec(multiplier)||"1");
  return {numerator:(r*m.n).toString(),denominator:m.d.toString()};
}
export function normalizeCorporateActionAsset(a){
  if(!a?.uid)throw new Error("uid required");
  return{
    uid:String(a.uid),symbol:String(a.symbol||""),chain_id:Number(a.chain_id),
    contract_address:String(a.contract_address||"").toLowerCase(),
    current_multiplier:dec(a.current_multiplier||"1"),
    pending_multiplier:dec(a.pending_multiplier),
    status:String(a.status||"UNKNOWN"),
    observed_at:String(a.observed_at||"")
  };
}
export function reconcileBalance({raw_balance,decimals,asset}){
  const a=normalizeCorporateActionAsset(asset);
  if(!/^[0-9]+$/.test(String(raw_balance)))throw new Error("raw balance");
  if(!Number.isInteger(decimals)||decimals<0||decimals>36)throw new Error("decimals");
  const adjusted=mulRaw(String(raw_balance),a.current_multiplier);
  return{
    identity:[a.chain_id,a.contract_address].join(":"),
    raw_balance:String(raw_balance),decimals,
    current_multiplier:a.current_multiplier,
    adjusted_exposure_numerator:adjusted.numerator,
    adjusted_exposure_denominator:adjusted.denominator,
    pending_multiplier:a.pending_multiplier,
    pending_change:a.pending_multiplier!==null&&a.pending_multiplier!==a.current_multiplier,
    observed_at:a.observed_at,
    label:"ECONOMIC_EXPOSURE_METADATA",
    disclaimer:"Multiplier-adjusted exposure metadata is not a claim of legal ownership of the underlying security."
  };
}
export function detectMultiplierChange(previous,current){
  const p=normalizeCorporateActionAsset(previous),c=normalizeCorporateActionAsset(current);
  if(p.uid!==c.uid)throw new Error("asset uid mismatch");
  if(p.chain_id!==c.chain_id||p.contract_address!==c.contract_address)throw new Error("asset identity mismatch");
  const changed=p.current_multiplier!==c.current_multiplier;
  const pendingChanged=p.pending_multiplier!==c.pending_multiplier;
  return{
    changed,pending_changed:pendingChanged,
    requires_snapshot:changed||pendingChanged,
    previous_multiplier:p.current_multiplier,current_multiplier:c.current_multiplier,
    previous_pending:p.pending_multiplier,current_pending:c.pending_multiplier
  };
}
export function corporateActionStamp(change){
  if(!change.requires_snapshot)return null;
  return{
    id:"CORPORATE_ACTION_OBSERVED",
    label:"Corporate Action Observed",
    evidence_class:"REFERENCE_ONLY",
    detail:{
      previous_multiplier:change.previous_multiplier,
      current_multiplier:change.current_multiplier,
      previous_pending:change.previous_pending,
      current_pending:change.current_pending
    }
  };
}
