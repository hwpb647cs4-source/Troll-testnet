export function auditViewModel(v){
  const errors=[];
  if(!v?.page_title)errors.push("PAGE_TITLE");
  if(!v?.language)errors.push("LANGUAGE");
  for(const [i,a] of (v?.actions||[]).entries()){
    if(!a.label)errors.push("ACTION_LABEL:"+i);
    if(a.icon_only&&!a.aria_label)errors.push("ICON_ARIA:"+i);
  }
  for(const [i,img] of (v?.images||[]).entries())if(!img.alt)errors.push("IMAGE_ALT:"+i);
  for(const [i,s] of (v?.status_messages||[]).entries())if(!["polite","assertive"].includes(s.live))errors.push("STATUS_LIVE:"+i);
  return{valid:errors.length===0,errors};
}
export function motionPolicy({prefersReducedMotion=false}={}){
  return prefersReducedMotion?{animation:"none",autoplay:false,parallax:false}:{animation:"standard",autoplay:false,parallax:false};
}
