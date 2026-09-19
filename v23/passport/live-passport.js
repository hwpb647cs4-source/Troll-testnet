import { ethers } from "https://esm.sh/ethers@6.13.4";
const NFT_ABI=[
"function ownerOf(uint256) view returns(address)","function familyOf(uint256) view returns(uint8)",
"function familyRevealed(uint256) view returns(bool)","function mintTimestamp(uint256) view returns(uint64)",
"function holderSince(uint256) view returns(uint64)","function totalSupply() view returns(uint256)",
"function maxSupply() view returns(uint256)","function genesisManifestSHA256() view returns(bytes32)",
"function familyMerkleRoot() view returns(bytes32)","function evolutionEngine() view returns(address)",
"function metadataRouter() view returns(address)","function tokenURI(uint256) view returns(string)"];
const EVO_ABI=["function burnedByTokenId(uint256) view returns(uint256)","function stateOf(uint256) view returns(uint8)",
"function rewardWeightBps(uint256) view returns(uint256)","function totalProjectBurn() view returns(uint256)",
"function troll() view returns(address)","function deadAddress() view returns(address)"];
const FAMILY=["GENESIS TROLL","SILVER","USDC","GOLD","APPLE","NVIDIA","MICROSOFT","AMAZON","ALPHABET","META","TESLA"];
const STATE=["GENESIS","AWAKENED","CHARGED","RELIC","ASCENDED","LEGENDARY","OMEGA"];
export async function loadLivePassport(config,tokenId){
 const provider=new ethers.JsonRpcProvider(config.network.rpc_url,config.network.chain_id,{staticNetwork:true});
 const nft=new ethers.Contract(config.genesis_nft,NFT_ABI,provider);
 const [owner,familyId,revealed,mintTimestamp,holderSince,totalSupply,maxSupply,genesisHash,familyRoot,evolutionAddress,metadataAddress,tokenURI,blockNumber]=await Promise.all([
 nft.ownerOf(tokenId),nft.familyOf(tokenId),nft.familyRevealed(tokenId),nft.mintTimestamp(tokenId),nft.holderSince(tokenId),
 nft.totalSupply(),nft.maxSupply(),nft.genesisManifestSHA256(),nft.familyMerkleRoot(),nft.evolutionEngine(),nft.metadataRouter(),nft.tokenURI(tokenId),provider.getBlockNumber()]);
 const evo=new ethers.Contract(evolutionAddress,EVO_ABI,provider);
 const [burned,stateId,weight,totalBurn,trollToken,deadAddress]=await Promise.all([
 evo.burnedByTokenId(tokenId),evo.stateOf(tokenId),evo.rewardWeightBps(tokenId),evo.totalProjectBurn(),evo.troll(),evo.deadAddress()]);
 const proof=config.known_testnet_proofs?.[String(tokenId)]||null, checks={};
 if(proof){checks.family=Number(familyId)===proof.expected_family;checks.burn=burned.toString()===proof.expected_burn_wei;checks.state=Number(stateId)===proof.expected_state;checks.weight=Number(weight)===proof.expected_weight_bps;checks.owner=owner.toLowerCase()===proof.expected_final_owner.toLowerCase();}
 return {schema_version:"23.0.0",mode:"LIVE_ONCHAIN_CORE",network:config.network,as_of_block:blockNumber,token_id:Number(tokenId),
 identity:{owner,family_id:Number(familyId),family:FAMILY[Number(familyId)]||"UNKNOWN",family_revealed:revealed,mint_timestamp:Number(mintTimestamp),holder_since:Number(holderSince),genesis_manifest_sha256:genesisHash,family_merkle_root:familyRoot,collection_supply:Number(totalSupply),max_supply:Number(maxSupply),token_uri:tokenURI},
 evolution:{engine:evolutionAddress,troll_token:trollToken,dead_address:deadAddress,troll_burned_raw:burned.toString(),troll_burned:ethers.formatEther(burned),state_id:Number(stateId),state:STATE[Number(stateId)]||"UNKNOWN",reward_weight_bps:Number(weight),reward_weight_x:Number(weight)/10000,project_burn_raw:totalBurn.toString()},
 metadata_router:metadataAddress,bound_vault:proof?.vault||null,proof_snapshot:proof?.proof_snapshot||null,proof_checks:checks,proof_checks_pass:proof?Object.values(checks).every(Boolean):null,
 evidence:{rpc:config.network.rpc_url,explorer:config.network.explorer,nft_contract:config.genesis_nft,as_of_block:blockNumber}};
}
export function deriveStamps(p){
 const out=[["GENESIS_I","Genesis I"],["FAMILY_VERIFIED",p.identity.family+" Family"],[p.evolution.state,p.evolution.state]];
 if(p.bound_vault)out.push(["VAULT_CREATED","Vault Created"]);
 if(p.proof_snapshot?.tGOLD)out.push(["GOLD_HELD","Gold Held"]);
 if(p.proof_snapshot?.tSILVER)out.push(["SILVER_HELD","Silver Held"]);
 if(p.proof_snapshot?.tNVDA)out.push(["STOCK_ENTITLEMENT","Stock Entitlement"]);
 if(p.proof_checks?.owner)out.push(["HISTORY_PRESERVED","History Preserved"]);
 if(p.proof_checks_pass)out.push(["PROOF_MATCH","Testnet Proof Match"]);
 return out.map(([id,label])=>({id,label}));
}