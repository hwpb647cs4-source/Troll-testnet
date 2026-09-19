import crypto from "node:crypto";

function canonical(v){
  if(Array.isArray(v))return "["+v.map(canonical).join(",")+"]";
  if(v&&typeof v==="object")return "{"+Object.keys(v).sort().filter(k=>!["bundle_sha256","generated_at"].includes(k)).map(k=>JSON.stringify(k)+":"+canonical(v[k])).join(",")+"}";
  return JSON.stringify(v);
}
export function sha256Canonical(v){return crypto.createHash("sha256").update(canonical(v)).digest("hex")}
export function buildProofBundle({tokenId,passport,timeline,rewardBiography,indexEvidence,generatedAt=new Date().toISOString()}){
  if(Number(tokenId)!==Number(passport?.token_id))throw new Error("token/passport mismatch");
  const bundle={
    schema_version:"31.0.0",
    token_id:Number(tokenId),
    generated_at:generatedAt,
    chain_id:passport?.network?.chain_id??passport?.evidence?.chain_id??null,
    as_of_block:passport?.as_of_block??passport?.evidence?.as_of_block??null,
    identity:{
      owner:passport?.identity?.owner??null,
      family:passport?.identity?.family??null,
      family_revealed:passport?.identity?.family_revealed??null,
      genesis_manifest_sha256:passport?.identity?.genesis_manifest_sha256??null,
      family_merkle_root:passport?.identity?.family_merkle_root??null
    },
    evolution:{
      state:passport?.evolution?.state??null,
      troll_burned_raw:passport?.evolution?.troll_burned_raw??null,
      reward_weight_bps:passport?.evolution?.reward_weight_bps??null
    },
    vault:{address:passport?.bound_vault??null},
    reward_biography:rewardBiography??null,
    timeline:timeline??[],
    index_evidence:indexEvidence??null,
    evidence_policy:{
      canonical_truth:"BLOCKCHAIN",
      live_balance_label:"LIVE_ONCHAIN_BALANCE",
      entitlement_label:"REGULATED_ENTITLEMENT",
      historical_label:"HISTORICAL_PROOF",
      reference_label:"REFERENCE_ONLY"
    },
    disclaimer:"This proof bundle records protocol state/evidence. It does not guarantee market value, investment returns, yield, redemption rights, or legal stock ownership."
  };
  bundle.bundle_sha256=sha256Canonical(bundle);
  return bundle;
}
export function verifyProofBundle(bundle){
  const actual=sha256Canonical(bundle);
  const errors=[];
  if(bundle.bundle_sha256!==actual)errors.push("BUNDLE_HASH_MISMATCH");
  if(!Number.isInteger(bundle.token_id)||bundle.token_id<1||bundle.token_id>5000)errors.push("TOKEN_ID");
  if(!Number.isInteger(bundle.chain_id)||bundle.chain_id<1)errors.push("CHAIN_ID");
  if(!bundle.identity?.genesis_manifest_sha256)errors.push("GENESIS_PROVENANCE");
  return {valid:errors.length===0,errors,computed_sha256:actual};
}
