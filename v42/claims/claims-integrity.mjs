const ALLOWED_EVIDENCE=new Set(["LIVE_ONCHAIN_BALANCE","REGULATED_ENTITLEMENT","HISTORICAL_PROOF","REFERENCE_ONLY"]);
const PROHIBITED=[
  {id:"GUARANTEED_RETURN",re:/guaranteed\s+(return|profit|appreciation|yield)/i},
  {id:"DIRECT_STOCK_OWNERSHIP",re:/\b(owns?|ownership of)\s+(apple|nvidia|microsoft|amazon|alphabet|google|meta|tesla)\s+(stock|shares?)\b/i},
  {id:"RISK_FREE",re:/\brisk[- ]?free\b/i},
  {id:"ROBINHOOD_ENDORSEMENT",re:/\b(official|endorsed|sponsored|approved)\s+by\s+robinhood\b/i},
  {id:"CERTAIN_PRICE",re:/\b(will|must)\s+(go up|moon|increase in value)\b/i}
];
export function validateClaim(c){
  const errors=[];
  if(!c?.id)errors.push("ID");
  if(!c?.text)errors.push("TEXT");
  if(!ALLOWED_EVIDENCE.has(c?.evidence_class))errors.push("EVIDENCE_CLASS");
  if(!c?.evidence_ref)errors.push("EVIDENCE_REF");
  for(const p of PROHIBITED)if(p.re.test(c?.text||""))errors.push(p.id);
  if(c.evidence_class==="REFERENCE_ONLY"&&/\b(holds?|owns?|balance|entitlement)\b/i.test(c.text||""))errors.push("REFERENCE_OVERCLAIM");
  return{valid:errors.length===0,errors};
}
export function auditClaims(claims){
  const results=claims.map(c=>({id:c.id,...validateClaim(c)}));
  return{valid:results.every(x=>x.valid),results,invalid:results.filter(x=>!x.valid)};
}
export function passportClaim({kind,symbol,amount,evidenceClass,evidenceRef}){
  if(kind==="BALANCE"&&evidenceClass!=="LIVE_ONCHAIN_BALANCE")throw new Error("balance requires live evidence");
  if(kind==="ENTITLEMENT"&&evidenceClass!=="REGULATED_ENTITLEMENT")throw new Error("entitlement requires regulated evidence");
  const text=kind==="BALANCE"
    ?`Verified on-chain ${symbol} token balance: ${amount}.`
    :`Recorded ${symbol} regulated entitlement: ${amount}.`;
  const claim={id:[kind,symbol,evidenceRef].join(":"),text,evidence_class:evidenceClass,evidence_ref:evidenceRef};
  const v=validateClaim(claim);if(!v.valid)throw new Error(v.errors.join(","));
  return claim;
}
