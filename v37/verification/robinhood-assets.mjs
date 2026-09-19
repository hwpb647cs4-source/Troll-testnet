const RHJ_ASSETS="https://api.robinhood.com/rhj/assets";
export function normalizeDeployment(d){return{chain_id:Number(d.chainId),contract_address:String(d.contractAddress),contract_address_lc:String(d.contractAddress).toLowerCase()}}
export function normalizeAsset(a){
  return{
    uid:a.id,token_symbol:a.tokenSymbol,token_name:a.tokenName,status:a.status,
    current_multiplier:a.currentMultiplier,pending_multiplier:a.pendingMultiplier||"",
    deployments:(a.deployments||[]).map(normalizeDeployment),
    trading_capabilities:a.tradingCapabilities??null
  };
}
export function findCanonicalDeployment(assets,symbol,chainId){
  const matches=assets.map(normalizeAsset).filter(a=>a.token_symbol===symbol);
  if(matches.length!==1)return{verified:false,reason:matches.length?"AMBIGUOUS_SYMBOL":"SYMBOL_NOT_FOUND"};
  const a=matches[0],deps=a.deployments.filter(d=>d.chain_id===Number(chainId));
  if(deps.length!==1)return{verified:false,reason:deps.length?"AMBIGUOUS_DEPLOYMENT":"CHAIN_DEPLOYMENT_NOT_FOUND",asset:a};
  return{verified:true,asset:a,deployment:deps[0],identity:[Number(chainId),deps[0].contract_address_lc].join(":")};
}
export function verifyConfiguredAsset(assets,configured){
  const r=findCanonicalDeployment(assets,configured.symbol,configured.chain_id);
  if(!r.verified)return r;
  const addressMatch=r.deployment.contract_address_lc===String(configured.contract_address).toLowerCase();
  const active=r.asset.status==="ASSET_STATUS_ACTIVE";
  return{...r,address_match:addressMatch,active,verified:r.verified&&addressMatch&&active,
    reason:!addressMatch?"CONTRACT_MISMATCH":!active?"ASSET_NOT_ACTIVE":"VERIFIED"};
}
export async function fetchOfficialAssets(fetchImpl=fetch){
  const r=await fetchImpl(RHJ_ASSETS,{headers:{accept:"application/json"}});
  if(!r.ok)throw new Error("RHJ assets API "+r.status);
  const body=await r.json();
  return body.assets||[];
}
export const OFFICIAL_ASSETS_ENDPOINT=RHJ_ASSETS;
