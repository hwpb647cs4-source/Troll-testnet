export const SUPPORTED=["en","pt-BR","es"];
export const FALLBACK="en";
export function locale(input){
  const s=String(input||"").replace("_","-");
  if(SUPPORTED.includes(s))return s;
  const lang=s.split("-")[0].toLowerCase();
  const hit=SUPPORTED.find(x=>x.toLowerCase()===lang||x.toLowerCase().startsWith(lang+"-"));
  return hit||FALLBACK;
}
export function t(dict,key,requested,...args){
  const l=locale(requested),value=dict?.[l]?.[key]??dict?.[FALLBACK]?.[key]??key;
  return typeof value==="function"?value(...args):value;
}
export function formatNumber(value,requested,opts={}){
  return new Intl.NumberFormat(locale(requested),opts).format(value);
}
export function formatDate(timestampSeconds,requested){
  return new Intl.DateTimeFormat(locale(requested),{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"}).format(new Date(Number(timestampSeconds)*1000));
}
