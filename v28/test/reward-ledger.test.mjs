import assert from "node:assert/strict";
import {createRewardLedger,tokenRewardBiography,safeAggregateUnits} from "../ledger/reward-ledger.mjs";
const rows=[
{epoch_id:"E1",token_id:1,chain_id:46630,asset_contract:"0xaaa",symbol:"tUSD",asset_class:"STABLE",label:"HISTORICAL_PROOF",amount_raw:"1000000000",decimals:6,evidence_ref:"tx:1"},
{epoch_id:"E1",token_id:1,chain_id:46630,asset_contract:"0xbbb",symbol:"tGOLD",asset_class:"GOLD",label:"HISTORICAL_PROOF",amount_raw:"100000000000000000",decimals:18,evidence_ref:"tx:2"},
{epoch_id:"E2",token_id:2,chain_id:4663,asset_contract:"0xccc",symbol:"ASSET",asset_class:"OTHER",label:"LIVE_ONCHAIN_BALANCE",amount_raw:"25",decimals:0,evidence_ref:"block:3"},
{epoch_id:"E2",token_id:1,chain_id:4663,asset_contract:"0xddd",symbol:"NVDA",asset_class:"STOCK",label:"REGULATED_ENTITLEMENT",amount_raw:"5",decimals:0,evidence_ref:"manifest:4"}
];
const l=createRewardLedger(rows);
assert.equal(l.rows.length,4);assert.equal(l.by_epoch.E1.length,2);assert.equal(l.by_token[1].length,3);
assert.equal(l.by_label.HISTORICAL_PROOF,2);assert.equal(tokenRewardBiography(l,1).epochs.length,2);
assert.equal(safeAggregateUnits(l).length,4);
assert.throws(()=>createRewardLedger([{...rows[0],label:"MARKET_VALUE"}]));
console.log("V28 REWARD LEDGER TEST PASS");
