const METHODS={
  "0x095ea7b3":"ERC20_APPROVE",
  "0xa22cb465":"ERC721_SET_APPROVAL_FOR_ALL",
  "0x23b872dd":"TRANSFER_FROM",
  "0x42842e0e":"SAFE_TRANSFER_FROM",
  "0xb88d4fde":"SAFE_TRANSFER_FROM_DATA"
};
export function classifyUnsignedStep(step,{knownContracts={}}={}){
  const warnings=[],blocks=[];
  if(!Number.isInteger(step.chain_id))blocks.push("CHAIN_ID_MISSING");
  if(!/^0x[0-9a-fA-F]{40}$/.test(step.to||""))blocks.push("TARGET_INVALID");
  const selector=(step.data||"0x").slice(0,10).toLowerCase(),method=METHODS[selector]||"UNKNOWN";
  const known=knownContracts[String(step.to||"").toLowerCase()]||null;
  if(!known)warnings.push("UNKNOWN_TARGET");
  if(method==="ERC721_SET_APPROVAL_FOR_ALL")warnings.push("GLOBAL_NFT_OPERATOR_APPROVAL");
  if(method==="ERC20_APPROVE")warnings.push("TOKEN_APPROVAL");
  if(["TRANSFER_FROM","SAFE_TRANSFER_FROM","SAFE_TRANSFER_FROM_DATA"].includes(method))warnings.push("ASSET_TRANSFER");
  if(BigInt(step.value_raw||"0")>0n)warnings.push("NATIVE_VALUE_TRANSFER");
  if(step.expected_chain_id&&step.chain_id!==step.expected_chain_id)blocks.push("WRONG_CHAIN");
  return{allowed:blocks.length===0,method,known_target:known,warnings,blocks};
}
export function holderConfirmationText(result,step){
  const parts=[`Network chain ID: ${step.chain_id}`,`Target: ${step.to}`,`Method: ${result.method}`];
  if(BigInt(step.value_raw||"0")>0n)parts.push(`Native value raw: ${step.value_raw}`);
  if(result.warnings.length)parts.push("Warnings: "+result.warnings.join(", "));
  if(result.blocks.length)parts.push("BLOCKED: "+result.blocks.join(", "));
  return parts.join("\n");
}
