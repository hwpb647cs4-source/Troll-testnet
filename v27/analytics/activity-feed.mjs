export function buildActivityFeed(index,{limit=100}={}){
  const tx=new Map();
  for(const e of index.timelines?.transfers||[]){
    const key=e.tx+":"+e.block+":"+e.token_id+":transfer";
    tx.set(key,{type:e.from==="0x0000000000000000000000000000000000000000"?"MINT":"TRANSFER",block:e.block,tx:e.tx,token_id:e.token_id,from:e.from,to:e.to});
  }
  for(const e of index.timelines?.burns||[]){
    const key=e.tx+":"+e.block+":"+e.token_id+":burn";
    tx.set(key,{type:"TROLL_BURN",block:e.block,tx:e.tx,token_id:e.token_id,owner:e.owner,credited_raw:e.credited_raw,cumulative_raw:e.cumulative_raw,state:e.state});
  }
  return [...tx.values()].sort((a,b)=>b.block-a.block).slice(0,limit);
}
