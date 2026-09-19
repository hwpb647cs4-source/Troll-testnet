export const SLOS={
  PASSPORT_FRESHNESS_SECONDS:{target:120,comparison:"LTE"},
  INDEX_LAG_BLOCKS:{target:20,comparison:"LTE"},
  RPC_SUCCESS_RATE_BPS:{target:9950,comparison:"GTE"},
  PROOF_VERIFY_SUCCESS_BPS:{target:10000,comparison:"GTE"},
  FALSE_FINANCIAL_STATE_COUNT:{target:0,comparison:"LTE"},
  RELEASE_GATE_BYPASS_COUNT:{target:0,comparison:"LTE"}
};
export function evaluateMetric(id,value){
  const s=SLOS[id];if(!s)throw new Error("unknown metric");
  const pass=s.comparison==="LTE"?value<=s.target:value>=s.target;
  return{id,value,target:s.target,comparison:s.comparison,pass};
}
export function healthReport(metrics){
  const results=Object.entries(metrics).map(([k,v])=>evaluateMetric(k,v));
  const critical=results.filter(x=>!x.pass&&["FALSE_FINANCIAL_STATE_COUNT","RELEASE_GATE_BYPASS_COUNT"].includes(x.id));
  const degraded=results.filter(x=>!x.pass&&!critical.includes(x));
  return{healthy:results.every(x=>x.pass),critical,degraded,results};
}
export function freshnessLabel(ageSeconds){
  if(ageSeconds<=120)return"FRESH";
  if(ageSeconds<=600)return"STALE";
  return"UNVERIFIED_REFRESH_REQUIRED";
}
