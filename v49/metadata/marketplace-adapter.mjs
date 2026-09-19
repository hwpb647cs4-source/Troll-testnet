const SAFE_TRAITS=new Set(["Series","Family","Evolution","Rarity","Reward Weight Tier","Vault Status","History Status"]);
function trait(trait_type,value,display_type){const x={trait_type,value};if(display_type)x.display_type=display_type;return x}
export function marketplaceMetadata(passport,{namePrefix="TROLL",imageUri,animationUri=null,externalUrl=null}={}){
  if(!passport?.token_id)throw new Error("token");
  if(!imageUri||!/^(ipfs|ar):\/\//.test(imageUri))throw new Error("immutable image");
  const attrs=[
    trait("Series","Genesis I"),
    trait("Family",passport.identity?.family||"Unrevealed"),
    trait("Evolution",passport.evolution?.state||"GENESIS"),
    trait("Reward Weight Tier",rewardTier(passport.evolution?.reward_weight_bps)),
    trait("Vault Status",passport.bound_vault?"Created":"Not Created"),
    trait("History Status",(passport.ownership?.transfer_count||0)>0?"Preserved":"Genesis Holder")
  ].filter(Boolean);
  const out={
    name:`${namePrefix} #${String(passport.token_id).padStart(4,"0")}`,
    description:"Persistent NFT identity with evidence-backed evolution and history. Financial-like state is verified separately in the Value Passport.",
    image:imageUri,
    attributes:attrs,
    properties:{
      passport_schema:passport.schema_version||null,
      evidence_url:externalUrl||null,
      family_verified:passport.identity?.family_revealed===true,
      token_id:Number(passport.token_id)
    }
  };
  if(animationUri)out.animation_url=animationUri;
  if(externalUrl)out.external_url=externalUrl;
  return out;
}
export function rewardTier(bps){
  const n=Number(bps||10000);
  if(n>=50000)return"OMEGA";
  if(n>=30000)return"LEGENDARY";
  if(n>=20000)return"ASCENDED";
  if(n>=15000)return"RELIC";
  if(n>=12500)return"CHARGED";
  if(n>10000)return"AWAKENED";
  return"GENESIS";
}
export function auditMarketplaceMetadata(m){
  const errors=[];
  if(!m.name)errors.push("NAME");
  if(!/^(ipfs|ar):\/\//.test(m.image||""))errors.push("IMAGE_NOT_CONTENT_ADDRESSED");
  for(const a of m.attributes||[])if(!SAFE_TRAITS.has(a.trait_type))errors.push("UNSAFE_TRAIT:"+a.trait_type);
  const text=JSON.stringify(m).toLowerCase();
  for(const bad of ["guaranteed return","guaranteed yield","floor value","owns nvidia shares","owns apple shares"])if(text.includes(bad))errors.push("CLAIM:"+bad);
  return{valid:errors.length===0,errors};
}
