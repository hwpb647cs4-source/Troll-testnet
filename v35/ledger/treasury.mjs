const TYPES=new Set(["MINT_REVENUE","ROYALTY_REVENUE","GRANT","B2B_REVENUE","SUBSCRIPTION_REVENUE","SECURITY_COST","INFRA_COST","LEGAL_COMPLIANCE_COST","PRODUCT_COST","REWARD_FUNDING","OTHER_COST"]);
const REVENUE=new Set(["MINT_REVENUE","ROYALTY_REVENUE","GRANT","B2B_REVENUE","SUBSCRIPTION_REVENUE"]);
const COST=new Set(["SECURITY_COST","INFRA_COST","LEGAL_COMPLIANCE_COST","PRODUCT_COST","REWARD_FUNDING","OTHER_COST"]);
export function normalizeTreasuryRow(r){
  if(!TYPES.has(r.type))throw new Error("invalid treasury type");
  if(!Number.isInteger(r.chain_id)||r.chain_id<0)throw new Error("invalid chain");
  if(!/^[0-9]+$/.test(String(r.amount_raw)))throw new Error("invalid amount");
  if(!Number.isInteger(r.decimals)||r.decimals<0||r.decimals>36)throw new Error("invalid decimals");
  return {...r,amount_raw:String(r.amount_raw),classification:REVENUE.has(r.type)?"REVENUE":"COST"};
}
export function treasuryReport(rows){
  const clean=rows.map(normalizeTreasuryRow),byIdentity={};
  for(const r of clean){
    const k=[r.chain_id,(r.asset_contract||r.asset_reference||"FIAT").toLowerCase(),r.decimals,r.classification].join(":");
    byIdentity[k]=(BigInt(byIdentity[k]||"0")+BigInt(r.amount_raw)).toString();
  }
  return {
    schema_version:"35.0.0",rows:clean,
    counts:{revenue:clean.filter(x=>x.classification==="REVENUE").length,cost:clean.filter(x=>x.classification==="COST").length},
    raw_units_by_exact_identity:byIdentity
  };
}
export function assertNoFakeRevenue(rows){
  const prohibited=["NFT_FLOOR_VALUE","VAULT_MARKET_VALUE","UNREALIZED_GAIN","WASH_VOLUME","SELF_TRANSFER"];
  for(const r of rows)if(prohibited.includes(r.type))throw new Error("PROHIBITED_REVENUE:"+r.type);
  return true;
}
