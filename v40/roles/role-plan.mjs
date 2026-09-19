const ZERO="0x0000000000000000000000000000000000000000";
export const REQUIRED_ROLES=["DEPLOYER","ADMIN_MULTISIG","MINT_CONTROLLER","ROYALTY_RECEIVER","ENTITLEMENT_ADMIN","SNAPSHOT_PUBLISHER"];
function addressOk(a){return /^0x[0-9a-fA-F]{40}$/.test(String(a||""))&&String(a).toLowerCase()!==ZERO}
export function validateRolePlan(plan){
  const errors=[],warnings=[];
  if(plan.chain_id!==4663)errors.push("CHAIN_ID");
  for(const role of REQUIRED_ROLES){
    const r=plan.roles?.[role];
    if(!r)errors.push("MISSING_"+role);
    else{
      if(!addressOk(r.address))errors.push("ADDRESS_"+role);
      if(r.status!=="VERIFIED")errors.push("UNVERIFIED_"+role);
      if(!r.evidence_ref)errors.push("EVIDENCE_"+role);
    }
  }
  const admin=plan.roles?.ADMIN_MULTISIG?.address?.toLowerCase();
  if(admin&&plan.roles?.DEPLOYER?.address?.toLowerCase()===admin)warnings.push("DEPLOYER_EQUALS_ADMIN");
  if(plan.roles?.ADMIN_MULTISIG?.type!=="MULTISIG")errors.push("ADMIN_NOT_MULTISIG");
  if(!Number.isInteger(plan.roles?.ADMIN_MULTISIG?.threshold)||plan.roles.ADMIN_MULTISIG.threshold<2)errors.push("MULTISIG_THRESHOLD");
  if((plan.roles?.ADMIN_MULTISIG?.signers||[]).length<plan.roles?.ADMIN_MULTISIG?.threshold)errors.push("MULTISIG_SIGNERS");
  return{valid:errors.length===0,errors,warnings};
}
export function ceremonyChecklist(plan){
  const v=validateRolePlan(plan);
  return{
    ready:v.valid,
    checks:[
      ["chain_4663",plan.chain_id===4663],
      ["all_roles_verified",REQUIRED_ROLES.every(x=>plan.roles?.[x]?.status==="VERIFIED")],
      ["admin_multisig",plan.roles?.ADMIN_MULTISIG?.type==="MULTISIG"],
      ["threshold_at_least_2",(plan.roles?.ADMIN_MULTISIG?.threshold||0)>=2],
      ["out_of_band_evidence",REQUIRED_ROLES.every(x=>!!plan.roles?.[x]?.evidence_ref)],
      ["no_private_keys_in_manifest",!JSON.stringify(plan).match(/private[_ -]?key|seed[_ -]?phrase|mnemonic/i)]
    ],
    errors:v.errors,warnings:v.warnings
  };
}
