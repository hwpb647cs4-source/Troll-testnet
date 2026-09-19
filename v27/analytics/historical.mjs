export const EVOLUTION_STATES=["GENESIS","AWAKENED","CHARGED","RELIC","ASCENDED","LEGENDARY","OMEGA"];

function median(values){
  if(!values.length)return null;
  const a=[...values].sort((x,y)=>x-y),m=Math.floor(a.length/2);
  return a.length%2?a[m]:(a[m-1]+a[m])/2;
}
function days(seconds){return seconds/86400}
export function buildHistoricalIntelligence(index,{blockTimestamps={},asOfTimestamp=null}={}){
  const transfers=index.timelines?.transfers||[];
  const burns=index.timelines?.burns||[];
  const tokens=index.tokens||{};
  const now=asOfTimestamp??Math.max(0,...Object.values(blockTimestamps).map(Number));

  const perToken={};
  for(const [id,t] of Object.entries(tokens)){
    perToken[id]={
      token_id:Number(id),owner:t.owner,transfer_count:t.transfer_count||0,
      burned_raw:t.burned_raw||"0",state:t.state||0,
      first_seen_block:t.minted_block??null,last_event_block:t.last_event_block??null,
      ownership_periods:[],burn_events:[],evolution_events:[],
      burn_acceleration:{last_24h_raw:"0",previous_24h_raw:"0",ratio:null}
    };
  }

  const open={};
  for(const e of transfers){
    const id=String(e.token_id),ts=Number(blockTimestamps[e.block]||0);
    if(e.from&&e.from!=="0x0000000000000000000000000000000000000000"){
      const key=id+":"+e.from.toLowerCase(),start=open[key];
      if(start!==undefined&&ts>=start){
        perToken[id]?.ownership_periods.push({owner:e.from,start_timestamp:start,end_timestamp:ts,duration_days:days(ts-start)});
        delete open[key];
      }
    }
    if(e.to&&e.to!=="0x0000000000000000000000000000000000000000")open[id+":"+e.to.toLowerCase()]=ts;
  }
  for(const [key,start] of Object.entries(open)){
    const [id,owner]=key.split(":");
    if(perToken[id]&&now>=start)perToken[id].ownership_periods.push({owner,start_timestamp:start,end_timestamp:null,duration_days:days(now-start)});
  }

  for(const e of burns){
    const id=String(e.token_id),ts=Number(blockTimestamps[e.block]||0);
    if(!perToken[id])continue;
    const row={block:e.block,timestamp:ts,credited_raw:e.credited_raw,cumulative_raw:e.cumulative_raw,state:e.state};
    perToken[id].burn_events.push(row);
    const prev=perToken[id].evolution_events.at(-1);
    if(!prev||prev.state!==e.state)perToken[id].evolution_events.push({block:e.block,timestamp:ts,state:e.state,state_name:EVOLUTION_STATES[e.state]||"UNKNOWN"});
    if(now&&ts){
      const age=now-ts,credit=BigInt(e.credited_raw||"0");
      if(age>=0&&age<=86400)perToken[id].burn_acceleration.last_24h_raw=(BigInt(perToken[id].burn_acceleration.last_24h_raw)+credit).toString();
      else if(age>86400&&age<=172800)perToken[id].burn_acceleration.previous_24h_raw=(BigInt(perToken[id].burn_acceleration.previous_24h_raw)+credit).toString();
    }
  }

  for(const p of Object.values(perToken)){
    const a=BigInt(p.burn_acceleration.last_24h_raw),b=BigInt(p.burn_acceleration.previous_24h_raw);
    p.burn_acceleration.ratio=b>0n?Number(a*10000n/b)/10000:(a>0n?null:0);
  }

  const completedPeriods=Object.values(perToken).flatMap(x=>x.ownership_periods).filter(x=>x.duration_days>=0);
  const currentPeriods=completedPeriods.filter(x=>x.end_timestamp===null);
  const familyStats={}; // family is joined by consumers from current passport/index if available
  const stateDistribution={};
  for(const t of Object.values(tokens)){
    const n=EVOLUTION_STATES[t.state||0]||"UNKNOWN";
    stateDistribution[n]=(stateDistribution[n]||0)+1;
  }

  const dailyBurn={};
  for(const e of burns){
    const ts=Number(blockTimestamps[e.block]||0);
    if(!ts)continue;
    const day=new Date(ts*1000).toISOString().slice(0,10);
    dailyBurn[day]=(BigInt(dailyBurn[day]||"0")+BigInt(e.credited_raw||"0")).toString();
  }

  return {
    schema_version:"27.0.0",
    as_of_timestamp:now,
    collection:{
      minted:index.metrics?.minted_tokens??index.totals?.mints??0,
      unique_owners:index.metrics?.current_unique_owners??Object.keys(index.owners||{}).length,
      transfers:index.totals?.transfers??0,
      burn_events:index.totals?.burn_events??0,
      total_burn_raw:index.totals?.total_burn_raw??"0",
      median_observed_holding_days:median(completedPeriods.map(x=>x.duration_days)),
      median_current_holding_days:median(currentPeriods.map(x=>x.duration_days)),
      state_distribution:stateDistribution
    },
    daily_burn:dailyBurn,
    tokens:perToken,
    family_stats:familyStats
  };
}
