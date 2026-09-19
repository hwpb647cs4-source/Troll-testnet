import { ethers } from "https://esm.sh/ethers@6.13.4";
const NFT_ABI=["function totalSupply() view returns(uint256)","function ownerOf(uint256) view returns(address)","function familyOf(uint256) view returns(uint8)","function familyRevealed(uint256) view returns(bool)","function evolutionEngine() view returns(address)"];
const EVO_ABI=["function burnedByTokenId(uint256) view returns(uint256)","function stateOf(uint256) view returns(uint8)","function rewardWeightBps(uint256) view returns(uint256)","function totalProjectBurn() view returns(uint256)"];
const FAMILY=["GENESIS TROLL","SILVER","USDC","GOLD","APPLE","NVIDIA","MICROSOFT","AMAZON","ALPHABET","META","TESLA"];
const STATE=["GENESIS","AWAKENED","CHARGED","RELIC","ASCENDED","LEGENDARY","OMEGA"];

async function mapLimit(items,limit,fn){
  const out=new Array(items.length); let next=0;
  async function worker(){while(true){const i=next++;if(i>=items.length)return;out[i]=await fn(items[i],i)}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));
  return out;
}
export async function loadCollection(config,{concurrency=6}={}){
  const provider=new ethers.JsonRpcProvider(config.network.rpc_url,config.network.chain_id,{staticNetwork:true});
  const nft=new ethers.Contract(config.genesis_nft,NFT_ABI,provider);
  const [supply,evolutionAddress,block]=await Promise.all([nft.totalSupply(),nft.evolutionEngine(),provider.getBlockNumber()]);
  const evo=new ethers.Contract(evolutionAddress,EVO_ABI,provider);
  const ids=Array.from({length:Number(supply)},(_,i)=>i+1);
  const rows=await mapLimit(ids,concurrency,async id=>{
    const [owner,familyId,revealed,burned,stateId,weight]=await Promise.all([
      nft.ownerOf(id),nft.familyOf(id),nft.familyRevealed(id),evo.burnedByTokenId(id),evo.stateOf(id),evo.rewardWeightBps(id)
    ]);
    return {token_id:id,owner,family_id:Number(familyId),family:FAMILY[Number(familyId)]||"UNKNOWN",family_revealed:revealed,
      burned_raw:burned.toString(),burned:Number(ethers.formatEther(burned)),state_id:Number(stateId),state:STATE[Number(stateId)]||"UNKNOWN",weight_bps:Number(weight)};
  });
  const totalBurn=await evo.totalProjectBurn();
  const families={},states={},owners=new Set();
  let evolved=0;
  for(const r of rows){families[r.family]=(families[r.family]||0)+1;states[r.state]=(states[r.state]||0)+1;owners.add(r.owner.toLowerCase());if(r.state_id>0)evolved++}
  const knownProofs=config.known_testnet_proofs||{};
  const proofStats={known_passports:Object.keys(knownProofs).length,direct_asset_rows:0,regulated_entitlement_rows:0};
  for(const p of Object.values(knownProofs)){for(const a of Object.values(p.proof_snapshot||{})){if(a.classification==="DIRECT_VAULT")proofStats.direct_asset_rows++;if(a.classification==="REGULATED_ENTITLEMENT")proofStats.regulated_entitlement_rows++;}}
  return {schema_version:"25.0.0",network:config.network,as_of_block:block,collection:{minted:Number(supply),max_supply:5000,unique_owners:owners.size,total_troll_burned:Number(ethers.formatEther(totalBurn)),evolved_count:evolved,evolved_pct:Number(supply)?evolved/Number(supply)*100:0},families,states,proof_evidence:proofStats,tokens:rows};
}
