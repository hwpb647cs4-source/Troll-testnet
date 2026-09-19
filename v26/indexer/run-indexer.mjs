import fs from "fs";
import { indexRange } from "./indexer.mjs";

const cfg=JSON.parse(fs.readFileSync(process.argv[2]||"v26/config/testnet.json","utf8"));
const outPath=process.argv[3]||"v26/generated/collection-index.json";
let prior=null;
if(fs.existsSync(outPath))prior=JSON.parse(fs.readFileSync(outPath,"utf8"));
const state=await indexRange({
  rpcUrl:process.env.RH_RPC_URL||cfg.rpc_url,
  chainId:cfg.chain_id,
  nftAddress:cfg.nft_contract,
  startBlock:cfg.start_block,
  state:prior,
  chunkSize:cfg.chunk_size||1500
});
fs.mkdirSync(outPath.split("/").slice(0,-1).join("/"),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify(state,null,2));
console.log("Indexed through",state.indexed_through_block);
console.log("Minted",state.metrics.minted_tokens,"Owners",state.metrics.current_unique_owners,"Burn events",state.totals.burn_events);
