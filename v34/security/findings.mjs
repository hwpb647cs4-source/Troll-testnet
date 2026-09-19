const SEVERITIES=["CRITICAL","HIGH","MEDIUM","LOW","INFORMATIONAL"];
const STATUSES=["OPEN","TRIAGED","FIX_IN_PROGRESS","FIX_READY_FOR_REVIEW","CLOSED_VERIFIED","ACCEPTED_RISK"];

export function normalizeFinding(f){
  if(!f?.id)throw new Error("finding id required");
  const severity=String(f.severity||"").toUpperCase();
  const status=String(f.status||"OPEN").toUpperCase();
  if(!SEVERITIES.includes(severity))throw new Error("invalid severity");
  if(!STATUSES.includes(status))throw new Error("invalid status");
  return {
    id:String(f.id),source:f.source||"UNKNOWN",severity,status,
    title:f.title||"",affected_surface:f.affected_surface||"",
    description:f.description||"",reproduction:f.reproduction||null,
    remediation:f.remediation||null,fix_commit:f.fix_commit||null,
    reviewer_verification:f.reviewer_verification||null,
    abi_storage_semantic_impact:f.abi_storage_semantic_impact||"UNKNOWN"
  };
}
export function releaseImpact(findings){
  const rows=findings.map(normalizeFinding);
  const open=rows.filter(x=>!["CLOSED_VERIFIED"].includes(x.status));
  const blockers=open.filter(x=>["CRITICAL","HIGH"].includes(x.severity));
  const medium=open.filter(x=>x.severity==="MEDIUM");
  const acceptedRisk=open.filter(x=>x.status==="ACCEPTED_RISK");
  return {
    release_blocked:blockers.length>0||medium.length>0,
    blockers,medium,accepted_risk:acceptedRisk,
    counts:Object.fromEntries(SEVERITIES.map(s=>[s,rows.filter(x=>x.severity===s).length]))
  };
}
export function reconcileFindings(...sources){
  const byId=new Map();
  for(const source of sources.flat()){
    const f=normalizeFinding(source);
    const old=byId.get(f.id);
    if(!old)byId.set(f.id,f);
    else{
      const rank=s=>STATUSES.indexOf(s);
      byId.set(f.id,rank(f.status)>rank(old.status)?{...old,...f}:{...f,...old});
    }
  }
  return [...byId.values()].sort((a,b)=>SEVERITIES.indexOf(a.severity)-SEVERITIES.indexOf(b.severity)||a.id.localeCompare(b.id));
}
