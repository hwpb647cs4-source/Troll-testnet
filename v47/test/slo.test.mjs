import assert from"node:assert/strict";import{evaluateMetric,healthReport,freshnessLabel}from"../observability/slo.mjs";
assert.equal(evaluateMetric("PASSPORT_FRESHNESS_SECONDS",60).pass,true);assert.equal(evaluateMetric("RPC_SUCCESS_RATE_BPS",9900).pass,false);
const h=healthReport({PASSPORT_FRESHNESS_SECONDS:60,INDEX_LAG_BLOCKS:5,RPC_SUCCESS_RATE_BPS:9990,PROOF_VERIFY_SUCCESS_BPS:10000,FALSE_FINANCIAL_STATE_COUNT:0,RELEASE_GATE_BYPASS_COUNT:0});assert.equal(h.healthy,true);
const bad=healthReport({FALSE_FINANCIAL_STATE_COUNT:1});assert.equal(bad.healthy,false);assert.equal(bad.critical.length,1);
assert.equal(freshnessLabel(100),"FRESH");assert.equal(freshnessLabel(300),"STALE");assert.equal(freshnessLabel(1000),"UNVERIFIED_REFRESH_REQUIRED");
console.log("V47 OBSERVABILITY SLO PASS");