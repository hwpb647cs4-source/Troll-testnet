import assert from"node:assert/strict";import{locale,t,formatNumber}from"../i18n/i18n.mjs";import{auditViewModel,motionPolicy}from"../accessibility/a11y.mjs";import strings from"../i18n/strings.json" with {type:"json"};
assert.equal(locale("pt-BR"),"pt-BR");assert.equal(locale("pt"),"pt-BR");assert.equal(locale("fr"),"en");
assert.equal(t(strings,"passport.title","pt-BR"),"Passaporte de Valor");assert.equal(t(strings,"field.family","es"),"Familia");
assert.ok(formatNumber(175000,"pt-BR").includes("175"));
const good={page_title:"TROLL",language:"pt-BR",actions:[{label:"Abrir"}],images:[{alt:"TROLL NFT"}],status_messages:[{live:"polite"}]};assert.equal(auditViewModel(good).valid,true);
assert.equal(auditViewModel({...good,images:[{alt:""}]}).valid,false);assert.equal(motionPolicy({prefersReducedMotion:true}).animation,"none");
console.log("V48 GLOBAL ACCESSIBILITY PASS");