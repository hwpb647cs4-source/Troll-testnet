export const REQUIRED_GATES=[
  ["V14_FULL_TESTNET","technical"],
  ["V19_SLITHER_ZERO_HIGH_MEDIUM","security"],
  ["V20_AUDIT_FREEZE","security"],
  ["V21_PRODUCTION_REHEARSAL","operations"],
  ["V31_PROOF_BUNDLES","evidence"],
  ["INDEPENDENT_HUMAN_AUDIT","external"],
  ["FINAL_REVIEWED_COMMIT_FROZEN","security"],
  ["PRODUCTION_MULTISIG","operations"],
  ["PRODUCTION_METADATA_CIDS","product"],
  ["EXACT_ASSET_REGISTRY","assets"],
  ["REGULATED_SETTLEMENT_APPROVED","assets"],
  ["DEDICATED_PRODUCTION_RPC","operations"],
  ["FINAL_DEPLOYMENT_REHEARSAL","operations"],
  ["EXPLICIT_MAINNET_AUTHORIZATION","external"]
];
export function evaluateRelease(gates){
  const rows=REQUIRED_GATES.map(([id,category])=>({id,category,status:gates[id]?.status||"OPEN",evidence:gates[id]?.evidence||null}));
  const blocking=rows.filter(x=>x.status!=="PASS");
  return {ready:blocking.length===0,rows,blocking,summary:{pass:rows.length-blocking.length,open:blocking.length,total:rows.length}};
}
export function assertNoBroadcast(gates){
  const r=evaluateRelease(gates);
  if(!r.ready)throw new Error("NO_MAINNET_BROADCAST:"+r.blocking.map(x=>x.id).join(","));
  return true;
}
