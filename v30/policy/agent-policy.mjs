const DEFAULTS={
  human_signature_required:true,
  simulation_required:true,
  allow_value_transfer:false,
  allowed_actions:["READ_PASSPORT","READ_BALANCES","READ_HISTORY","PREPARE_EVOLUTION","PREPARE_APPROVED_REWARD"],
  max_troll_burn_raw_per_action:"0",
  approved_targets:[],
  approved_asset_contracts:[]
};
export function normalizePolicy(p={}){return {...DEFAULTS,...p,approved_targets:[...(p.approved_targets||[])].map(x=>x.toLowerCase()),approved_asset_contracts:[...(p.approved_asset_contracts||[])].map(x=>x.toLowerCase())}}
export function evaluateAgentIntent(policyInput,intent){
  const p=normalizePolicy(policyInput),reasons=[];
  if(!p.allowed_actions.includes(intent.action))reasons.push("ACTION_NOT_ALLOWED");
  if(intent.target&&p.approved_targets.length&&!p.approved_targets.includes(intent.target.toLowerCase()))reasons.push("TARGET_NOT_APPROVED");
  if(intent.asset_contract&&p.approved_asset_contracts.length&&!p.approved_asset_contracts.includes(intent.asset_contract.toLowerCase()))reasons.push("ASSET_NOT_APPROVED");
  if(intent.native_value_raw&&BigInt(intent.native_value_raw)>0n&&!p.allow_value_transfer)reasons.push("NATIVE_VALUE_BLOCKED");
  if(intent.action==="PREPARE_EVOLUTION"){
    const max=BigInt(p.max_troll_burn_raw_per_action||"0"),amount=BigInt(intent.troll_burn_raw||"0");
    if(max===0n||amount>max)reasons.push("BURN_LIMIT");
  }
  return {allowed:reasons.length===0,reasons,human_signature_required:p.human_signature_required,simulation_required:p.simulation_required};
}
export function prepareUnsignedStep(policy,intent,simulation){
  const decision=evaluateAgentIntent(policy,intent);
  if(!decision.allowed)return {status:"BLOCKED",decision};
  if(decision.simulation_required&&(!simulation||simulation.success!==true))return {status:"SIMULATION_REQUIRED",decision};
  return {status:"OWNER_SIGNATURE_REQUIRED",decision,unsigned:{chain_id:intent.chain_id,to:intent.target,data:intent.data||"0x",value_raw:intent.native_value_raw||"0"},simulation};
}
