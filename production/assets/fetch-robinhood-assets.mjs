import fs from "node:fs";
const ENDPOINT="https://api.robinhood.com/rhj/assets";
const WANTED=["AAPL","NVDA","MSFT","AMZN","GOOGL","META","TSLA","GLD","SLV"];
const r=await fetch(ENDPOINT,{headers:{accept:"application/json"}});
if(!r.ok)throw new Error("RHJ assets API "+r.status);
const body=await r.json();
const rows=[];
for(const symbol of WANTED){
  const hits=(body.assets||[]).filter(a=>a.tokenSymbol===symbol);
  if(hits.length!==1){
    rows.push({symbol,status:"NOT_UNIQUELY_RESOLVED",matches:hits.length});
    continue;
  }
  const a=hits[0];
  const deps=(a.deployments||[]).filter(d=>Number(d.chainId)===4663);
  if(deps.length!==1){
    rows.push({symbol,status:"NO_UNIQUE_CHAIN_4663_DEPLOYMENT",matches:deps.length});
    continue;
  }
  rows.push({
    symbol,
    token_name:a.tokenName,
    asset_uid:a.id,
    chain_id:4663,
    contract_address:deps[0].contractAddress,
    decimals:a.tokenDecimals,
    current_multiplier:a.currentMultiplier,
    pending_multiplier:a.pendingMultiplier||"",
    status:a.status,
    trading_capabilities:a.tradingCapabilities||null,
    isin:a.isin||null,
    source:ENDPOINT,
    observed_at:new Date().toISOString()
  });
}
const out={
  schema_version:"1.0.0",
  source:ENDPOINT,
  chain_id:4663,
  selection:WANTED,
  assets:rows,
  note:"Generated directly from Robinhood's official RHJ assets API. Re-fetch immediately before final mainnet freeze."
};
fs.mkdirSync("production/assets",{recursive:true});
fs.writeFileSync("production/assets/robinhood-assets.generated.json",JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
if(rows.some(x=>x.status&&x.status!=="ASSET_STATUS_ACTIVE"&&x.status!=="NOT_UNIQUELY_RESOLVED")) process.exit(1);
