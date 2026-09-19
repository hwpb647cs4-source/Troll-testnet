import { derivePassportStamps, valuePassportSummary } from "../sdk/troll-passport-sdk.mjs";

const sample={
  token_id:1,
  identity:{series:"GENESIS_I",family:"NVIDIA",family_revealed:true},
  evolution:{state:"ASCENDED",reward_weight_x:2},
  bound_vault:"0xf231D1F888cC7fb3A5d84f48a345B6CBbCf3D866e",
  live_assets:[
    {asset_class:"GOLD"},
    {asset_class:"SILVER"}
  ],
  entitlements:[{reference:"NVDA"}],
  ownership:{transfer_count:1},
  agent:{human_signature_required:true},
  evidence:{as_of_block:123}
};

console.log(JSON.stringify({
  stamps:derivePassportStamps(sample),
  summary:valuePassportSummary(sample)
},null,2));
