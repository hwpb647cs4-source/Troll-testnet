import process from "node:process";
const EXPECTED_CHAIN_ID=4663;
const url=process.env.RH_RPC_URL;
if(!url)throw new Error("RH_RPC_URL secret/environment variable is required");
if(url.includes("{API_KEY}")||url.includes("REPLACE"))throw new Error("RH_RPC_URL is still a placeholder");
async function rpc(method,params=[]){
  const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})});
  if(!r.ok)throw new Error("RPC HTTP "+r.status);
  const j=await r.json();
  if(j.error)throw new Error(j.error.message||JSON.stringify(j.error));
  return j.result;
}
const chainHex=await rpc("eth_chainId");
const chainId=parseInt(chainHex,16);
if(chainId!==EXPECTED_CHAIN_ID)throw new Error("Wrong chain ID: "+chainId);
const blockHex=await rpc("eth_blockNumber");
const blockNumber=parseInt(blockHex,16);
if(!Number.isInteger(blockNumber)||blockNumber<=0)throw new Error("Invalid block number");
console.log(JSON.stringify({status:"PASS",chain_id:chainId,latest_block:blockNumber,rpc_url_redacted:true},null,2));
