const LEVELS=["SEV0","SEV1","SEV2","SEV3"];
const TYPES=["CONTRACT","ROLE","ASSET_REGISTRY","METADATA","INDEXER","PASSPORT","RPC","ENTITLEMENT","TREASURY","SECURITY_DISCLOSURE"];
export function classifyIncident(i){
  if(!TYPES.includes(i.type))throw new Error("invalid type");
  const flags=i.flags||{};
  let severity="SEV3";
  if(flags.active_asset_loss||flags.private_key_exposure||flags.unauthorized_admin_change)severity="SEV0";
  else if(flags.contract_exploit||flags.wrong_asset_enabled||flags.false_financial_state||flags.release_gate_bypass)severity="SEV1";
  else if(flags.index_corruption||flags.metadata_mismatch||flags.rpc_outage||flags.passport_stale)severity="SEV2";
  return{...i,severity};
}
export function responsePlan(i){
  const x=classifyIncident(i),steps=["PRESERVE_EVIDENCE","OPEN_INCIDENT_RECORD"];
  if(["SEV0","SEV1"].includes(x.severity))steps.push("STOP_NEW_MINT_REWARD_OPERATIONS_WHERE_POSSIBLE","NOTIFY_SECURITY_REVIEWERS","BLOCK_RELEASE");
  if(x.type==="ASSET_REGISTRY"||x.flags?.wrong_asset_enabled)steps.push("DISABLE_AFFECTED_ASSET");
  if(x.type==="INDEXER"||x.flags?.index_corruption)steps.push("REWIND_AND_REPLAY_INDEX");
  if(x.type==="PASSPORT"||x.flags?.false_financial_state)steps.push("MARK_AFFECTED_DATA_STALE_OR_UNVERIFIED");
  if(x.type==="RPC"||x.flags?.rpc_outage)steps.push("FAILOVER_READ_PROVIDER");
  if(x.flags?.private_key_exposure)steps.push("ROTATE_AFFECTED_ROLE_VIA_APPROVED_CEREMONY");
  steps.push("ROOT_CAUSE","ADD_REGRESSION","INDEPENDENT_VERIFY","POSTMORTEM");
  return{severity:x.severity,steps:[...new Set(steps)]};
}
export function canCloseIncident(i){
  const required=["root_cause","remediation","regression_evidence","verification_evidence","postmortem"];
  const missing=required.filter(k=>!i[k]);
  return{closable:missing.length===0,missing};
}
