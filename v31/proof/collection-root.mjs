import crypto from "node:crypto";
function h(x){return crypto.createHash("sha256").update(x).digest()}
function pair(a,b){return Buffer.compare(a,b)<=0?h(Buffer.concat([a,b])):h(Buffer.concat([b,a]))}
export function proofBundleLeaf(tokenId,bundleSha256){return h(Buffer.from(String(tokenId)+":"+bundleSha256))}
export function collectionProofRoot(entries){
  if(!entries.length)return null;
  let layer=entries.map(x=>proofBundleLeaf(x.token_id,x.bundle_sha256));
  while(layer.length>1){
    const next=[];
    for(let i=0;i<layer.length;i+=2)next.push(pair(layer[i],layer[i+1]||layer[i]));
    layer=next;
  }
  return "0x"+layer[0].toString("hex");
}
