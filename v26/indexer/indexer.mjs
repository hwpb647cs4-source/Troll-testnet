import { ethers } from "ethers";

const NFT_ABI=[
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)",
  "function evolutionEngine() view returns(address)",
  "function totalSupply() view returns(uint256)"
];
const EVO_ABI=[
  "event TrollBurned(uint256 indexed tokenId,address indexed owner,uint256 requestedAmount,uint256 creditedAmount,uint256 cumulativeAmount,uint8 state)",
  "function totalProjectBurn() view returns(uint256)"
];

export function emptyState(chainId,nftAddress,startBlock){
  return {
    schema_version:"26.0.0",
    chain_id:Number(chainId),
    nft_contract:nftAddress,
    start_block:Number(startBlock),
    indexed_through_block:Number(startBlock)-1,
    tokens:{},
    owners:{},
    totals:{mints:0,transfers:0,burn_events:0,total_burn_raw:"0"},
    timelines:{transfers:[],burns:[]}
  };
}
function token(s,id){
  const k=String(id);
  return s.tokens[k]||(s.tokens[k]={token_id:Number(id),owner:null,minted_block:null,transfer_count:0,burned_raw:"0",state:0,last_event_block:null});
}
function ownerDelta(s,address,delta){
  if(!address||address===ethers.ZeroAddress)return;
  const k=address.toLowerCase();
  s.owners[k]=(s.owners[k]||0)+delta;
  if(s.owners[k]===0)delete s.owners[k];
}
export function applyTransfer(s,e){
  const t=token(s,e.tokenId);
  const from=e.from.toLowerCase(),to=e.to.toLowerCase();
  if(from===ethers.ZeroAddress){
    s.totals.mints++;
    t.minted_block=e.blockNumber;
  }else{
    s.totals.transfers++;
    t.transfer_count++;
    ownerDelta(s,from,-1);
  }
  if(to!==ethers.ZeroAddress)ownerDelta(s,to,1);
  t.owner=to===ethers.ZeroAddress?null:e.to;
  t.last_event_block=e.blockNumber;
  s.timelines.transfers.push({block:e.blockNumber,tx:e.transactionHash,token_id:Number(e.tokenId),from:e.from,to:e.to});
}
export function applyBurn(s,e){
  const t=token(s,e.tokenId);
  t.burned_raw=e.cumulativeAmount.toString();
  t.state=Number(e.state);
  t.last_event_block=Math.max(t.last_event_block||0,e.blockNumber);
  s.totals.burn_events++;
  s.timelines.burns.push({
    block:e.blockNumber,tx:e.transactionHash,token_id:Number(e.tokenId),owner:e.owner,
    requested_raw:e.requestedAmount.toString(),credited_raw:e.creditedAmount.toString(),
    cumulative_raw:e.cumulativeAmount.toString(),state:Number(e.state)
  });
}
export function finalize(s,totalBurnRaw,throughBlock){
  s.indexed_through_block=Number(throughBlock);
  s.totals.total_burn_raw=totalBurnRaw.toString();
  s.metrics={
    minted_tokens:Object.values(s.tokens).filter(x=>x.minted_block!==null).length,
    current_unique_owners:Object.keys(s.owners).length,
    holder_positions:Object.values(s.owners).reduce((a,b)=>a+b,0),
    evolved_tokens:Object.values(s.tokens).filter(x=>x.state>0).length
  };
  return s;
}
export async function indexRange({rpcUrl,chainId,nftAddress,startBlock,endBlock,state,chunkSize=1500}){
  const provider=new ethers.JsonRpcProvider(rpcUrl,chainId,{staticNetwork:true});
  const nft=new ethers.Contract(nftAddress,NFT_ABI,provider);
  const evolutionAddress=await nft.evolutionEngine();
  const evo=new ethers.Contract(evolutionAddress,EVO_ABI,provider);
  const s=state||emptyState(chainId,nftAddress,startBlock);
  let from=Math.max(Number(startBlock),Number(s.indexed_through_block)+1);
  const latest=endBlock??await provider.getBlockNumber();
  while(from<=latest){
    const to=Math.min(latest,from+chunkSize-1);
    const [transfers,burns]=await Promise.all([
      nft.queryFilter(nft.filters.Transfer(),from,to),
      evo.queryFilter(evo.filters.TrollBurned(),from,to)
    ]);
    const events=[
      ...transfers.map(x=>({kind:"transfer",blockNumber:x.blockNumber,transactionIndex:x.transactionIndex,index:x.index,transactionHash:x.transactionHash,from:x.args.from,to:x.args.to,tokenId:x.args.tokenId})),
      ...burns.map(x=>({kind:"burn",blockNumber:x.blockNumber,transactionIndex:x.transactionIndex,index:x.index,transactionHash:x.transactionHash,tokenId:x.args.tokenId,owner:x.args.owner,requestedAmount:x.args.requestedAmount,creditedAmount:x.args.creditedAmount,cumulativeAmount:x.args.cumulativeAmount,state:x.args.state}))
    ].sort((a,b)=>a.blockNumber-b.blockNumber||a.transactionIndex-b.transactionIndex||a.index-b.index);
    for(const e of events)e.kind==="transfer"?applyTransfer(s,e):applyBurn(s,e);
    s.indexed_through_block=to;
    from=to+1;
  }
  return finalize(s,await evo.totalProjectBurn(),latest);
}
